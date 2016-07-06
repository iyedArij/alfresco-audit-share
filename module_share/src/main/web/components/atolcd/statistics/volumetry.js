/*
 * Copyright (C) 2013 Atol Conseils et Développements.
 * http://www.atolcd.com/
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// AtolStatistics namespace
if (typeof AtolStatistics == "undefined" || !AtolStatistics) { var AtolStatistics = {}; }

/**
 * Volumetry tool component.
 *
 * @namespace AtolStatistics
 * @class AtolStatistics.Volumetry
 */
(function () {
  /**
   * YUI Library aliases
   */
  var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

  /**
   * Volumetry constructor.
   *
   * @param {String} htmlId The HTML id of the parent element
   * @return {AtolStatistics.Volumetry} The new Volumetry instance
   * @constructor
   */
  AtolStatistics.Volumetry = function Volumetry_constructor(htmlId) {
    AtolStatistics.Volumetry.superclass.constructor.call(this, "AtolStatistics.Volumetry", htmlId, ["button", "container", "json"]);
    Event.addListener(window, 'resize', this.onWindowResize, this, true);
    return this;
  };

  YAHOO.extend(AtolStatistics.Volumetry, AtolStatistics.Tool, {
    /**
     * Fired by YUI when parent element is available for scripting.
     * Component initialisation, including instantiation of YUI widgets and event listener binding.
     *
     * @method onReady
     */
    onReady: function Volumetry_onReady() {
      AtolStatistics.Volumetry.superclass.onReady.call(this);

      var me = this,

      // Disable PNG export for the Connection charts
      elements = this.widgets.exportButton.getMenu().getItems();
      for (var i=0, ii=elements.length ; i<ii ; i++) {
        if (elements[i].value == "onIMGExport") {
          elements[i].cfg.setProperty("disabled", true);
          break;
        }
      }

      // Chart type button
      this.widgets.chartTypeCriteriaButton = new YAHOO.widget.Button(this.id + "-chart-type-criteria", {
        type: "split",
        menu: this.id + "-chart-type-criteria-select",
        lazyloadmenu: false
      });

      var onChartTypeMenuItemClick = function (p_sType, p_aArgs, p_oItem) {
        var sText = p_aArgs[1].cfg.getProperty("text"),
            value = p_aArgs[1].value;

        me.widgets.chartTypeCriteriaButton.value = value;
        me.widgets.chartTypeCriteriaButton.set("label", sText);
        me.execute();
      };
      this.widgets.chartTypeCriteriaButton.getMenu().subscribe("click", onChartTypeMenuItemClick);

      // Stacked charts
      Event.addListener(this.id + "-bar_stack-criteria", "click", this.onShowStackedBar, null, this);

      this.loadSites();
    },

    onCSVExport: function Volumetry_onCSVExport() {
      if (this.lastRequest.params) {
        var params = this.lastRequest.params;
        params += "&type=volumetry";
        params += "&values=" + String(this.lastRequest.values);
        params += "&interval=" + this.lastRequest.dateFilter;
        var url = Alfresco.constants.PROXY_URI + "share-stats/export-audits" + params; // ?json=" + escape(YAHOO.lang.JSON.stringify(this.lastRequest.data)); // JSON.stringify
        window.open(url);
      }
    },

    onSearch: function Volumetry_onSearch() {
      // Retrieve variables from UI
      var dateFilter = this.options.currentDateFilter,
          site = this.convertMenuValue(this.widgets.siteButton.value),
          tsString = "",
          params = "";

      // Date range table
      if (dateFilter) {
        tsString = this.buildTimeStampArray().toString();
      }

      params = "?dates=" + tsString;
      if (site) {
        if (site.indexOf(',') >= 0) {
          // Encode site ids
          var sites = [],
              sitesArray = site.split(',');
          for (var i=0, ii=sitesArray.length ; i<ii ; i++) {
            sites.push(encodeURIComponent(sitesArray[i]));
          }

          params += "&sites=" + sites.join(',');
        } else {
          params += "&site=" + encodeURIComponent(site);
        }
      }

      // Stacked values ?
      if (!this.options.siteId && !Dom.hasClass(this.id + "-bar-stack-criteria-container", "hidden") && (Dom.get(this.id + "-bar_stack-criteria").checked == true)) {
        params += "&stacked=true";
      }

      // Build query parameters
      this.lastRequest.params = params;
      this.lastRequest.dateFilter = dateFilter;

      var url = Alfresco.constants.PROXY_URI + "share-stats/select-volumetry" + this.lastRequest.params;

      // Display bars or lines depending on the option selected. (Lines by default)
      chartType = (this.widgets.chartTypeCriteriaButton.value == "bar") ? "bar" : "line";

      Alfresco.util.Ajax.jsonGet({
        url: url,
        successCallback: {
          fn: this.displayVolumetryGraph,
          scope: this
        },
        failureMessage: this.msg("label.popup.query.error"),
        execScripts: true,
        additionalsParams: {
          chartType: chartType,
          site: site,
          siteTitle: this.sites[site] || '',
          tsString: tsString
        }
      });
    },

    onSiteMenuClick: function Volumetry_onSiteMenuClick(p_sType, p_aArgs, p_oItem) {
      var sText = p_oItem.cfg.getProperty("text"),
          value = p_oItem.value;

      if (value == "" || value.indexOf(',') >= 0) { // All sites
        Dom.removeClass(this.id + "-bar-stack-criteria-container", "hidden");
      } else {
        Dom.addClass(this.id + "-bar-stack-criteria-container", "hidden");
      }

      this.widgets.siteButton.value = value;
      this.widgets.siteButton.set("label", sText);
      this.execute();
    },

    createSiteMenu: function Volumetry_createSiteMenu(res, hideAllSiteEntry) {
      if (this.options.siteId && this.options.siteId != "") {
        Dom.addClass(this.id + "-bar-stack-criteria-container", "hidden");
      }

      AtolStatistics.Volumetry.superclass.createSiteMenu.call(this, res, hideAllSiteEntry);
    },

    // Refresh the chart page after resizing
    onWindowResize: function Volumetry_onWindowResize() {
      if (this.volumetryChart) {
        var resizeParameters = {
          currentFilter: this.options.currentDateFilter,
          additionalsParams: {
            tsString: this.buildTimeStampArray().toString()
          },
          chartDomId: this.id + '-chart'
        };
        this.volumetryChart.categories(buildBarChartXLabels(resizeParameters, this.options.chartLabelSizeMin));
      }
    },

    displayVolumetryGraph: function Volumetry_displayVolumetryGraph(response) {
      if (response.json) {
        var displayParameters = {
          currentFilter: this.options.currentDateFilter,
          additionalsParams: response.config.additionalsParams,
          chartDomId: this.id + "-chart"
        };

        var chartArguments = {
          bindto: '#' + displayParameters.chartDomId,
          data: {
            columns: []
          },
          size: {
            height: 450
          },
          grid: {
            x: { show: true },
            y: { show: true }
          },
          title: {
            text: buildTitle(displayParameters)
          },
          point: { show: false },
          axis: {
            x: {
              type: 'category',
              categories: buildBarChartXLabels(displayParameters, this.options.chartLabelSizeMin),
              tick: {
                multiline: false,
                outer: false
              }
            },
            y: {
              tick: { format: d3.format("") },
              label: {
                position: 'outer-middle'
              }
            }
          }
        }

        switch (displayParameters.additionalsParams.chartType) {
          case "bar":
            chartArguments.data.type = 'bar';
          break;
          default :
          case "line":
            chartArguments.point.show = true;
          break;
        };

        if (Dom.get(this.id + "-bar_stack-criteria").checked) {    // Volumetry conversion by sites
          var labelVolumetry = (this.msg("tool.volumetry.label") +" ("+ AtolStatistics.util.formatFileSize(response.json.maxLocal).message +")"),
            value_obj = {};

          chartArguments.axis.y.label.text = [labelVolumetry];
          for (var i=0, ii=response.json.stackedValues.length ; i<ii ; i++) {
            var values = response.json.stackedValues[i];
            for (var j=0, jj=values.length ; j<jj ; j++) {
              var siteId = response.json.sites[j];
              if (!value_obj[siteId]) {
                value_obj[siteId] = [siteId];
              }

              var valueConvert = AtolStatistics.util.formatFileSize(values[j]),
                stackedConvert = AtolStatistics.util.formatFileSize(response.json.maxLocal),
                jsonConvertStackedValue = valueConvert.value;

              if (valueConvert.message != stackedConvert.message) {
                jsonConvertStackedValue = AtolStatistics.util.roundNumber(values[j] / stackedConvert.unitValue, 2); // Convert format of a value when it's different from the max format
              }
              value_obj[siteId].push(jsonConvertStackedValue);

              // Complete Columns of matrices and build groups array when we are on the last iteration of the first loop
              if (i == response.json.stackedValues.length - 1) {
                chartArguments.data.columns.push(value_obj[siteId]);
              }
            }
          }
          chartArguments.data.groups = [response.json.sites];

        } else {    //Conversion of total volumetries
          var jsonConvertValues = [],
            labelVolumetry = (this.msg("tool.volumetry.label") +" ("+ AtolStatistics.util.formatFileSize(response.json.maxCount).message +")");

          chartArguments.axis.y.label.text = [labelVolumetry];
          for (var i=0, ii=response.json.values.length ; i<ii ; i++) {
            jsonConvertValues[i] = AtolStatistics.util.formatFileSize(response.json.values[i]).value; // json responses converted in the right format (Bytes, Kb, Mb, Gb or Tb)
          }
          chartArguments.data.columns.push([labelVolumetry].concat(jsonConvertValues));
        }

        // Recovery of the connection values and reactivation of the export button
        this.lastRequest.values = response.json.values;
        this.widgets.exportButton.set("disabled", false);

        // build chart
        this.volumetryChart = c3.generate(chartArguments);
      } else {
        if (this.volumetryChart) {
          this.volumetryChart.unload(); // chart unloading
        }
        this.widgets.exportButton.set("disabled", true);
      }
    },

    onShowStackedBar: function Volumetry_onShowStackedBar() {
      this.execute();
    }
  });
})();