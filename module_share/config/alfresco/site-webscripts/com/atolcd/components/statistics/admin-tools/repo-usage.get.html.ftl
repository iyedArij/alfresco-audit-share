<#assign el = args.htmlid?html />

<script type="text/javascript">//<![CDATA[
  new AtolStatistics.RepoUsage("${args.htmlid?js_string}").setOptions({
      pathToSwf: "${page.url.context}/res/components/atolcd/statistics/open_flash_chart/open-flash-chart.swf",
      siteId: "${page.url.templateArgs.site!""}",
      currentUser: "${user.name?js_string}",
      isAdmin: ${user.isAdmin?string},
      limit: 10
    }
  ).setMessages(${messages});
//]]></script>

<div id="${el}-body" class="statistic-tool">
  <div id="${el}-repo-usage">
    <div class="yui-g">
      <div class="yui-u first">
        <div class="title">
          ${msg("label.title")}
        </div>
      </div>
      <div class="yui-u align-right">&nbsp;</div>
    </div>
    <div class="yui-g separator">
      <div class="header">

        <div id="criterias" class="criterias">
          <input type="button" class="criterias-button" id="module-criteria" name="${el}-module-criteria-button" value="${msg('graph.label.repository')}" />
          <select id="module-criteria-select" name="${el}-module-criteria-select">
            <option value="document">${msg("graph.label.repository")}</option>
          </select>

          <input type="button" class="criterias-button" id="action-criteria" name="${el}-action-criteria-button" value="${msg('label.menu.action')}${msg('label.read')}" />
          <select id="action-criteria-select" name="${el}-action-criteria-select">
            <option value="read">${msg("label.menu.action")}${msg("label.read")}</option>
            <option value="created">${msg("label.menu.action")}${msg("label.created")}</option>
            <option value="deleted">${msg("label.menu.action")}${msg("label.deleted")}</option>
            <option value="updated">${msg("label.menu.action")}${msg("label.updated")}</option>
          </select>

          <input type="button" class="criterias-button" id="site-criteria" name="${el}-site-criteria-button" value="${msg('graph.label.repository')}" />
          <select id="site-criteria-select" name="${el}-site-criteria-select">
            <option value="/repo">${msg("graph.label.repository")}</option>
          </select>

          <span class="yui-button yui-push-button" id="${el}-export-button">
            <span class="first-child"><button>${msg("button.export")}</button></span>
          </span>
        </div>

        <div class="yui-u separator filters">
          <span id="home">
            <span class="home-img" title="${msg('label.home')}"></span>
          </span>
          <span id="${el}-by-days">
            <a href="#">${msg("label.byDay")}</a>
          </span>
          <span class="vb"> | </span>
          <span id="${el}-by-weeks">
            <a href="#">${msg("label.byWeek")}</a>
          </span>
          <span class="vb"> | </span>
          <span id="${el}-by-months">
            <a href="#">${msg("label.byMonth")}</a>
          </span>
          <span class="vb"> | </span>
          <span id="${el}-by-years">
            <a href="#">${msg("label.byYear")}</a>
          </span>
        </div>
      </div>
    </div>

    <div id="${el}-chart-body" class="main-chart">
      <div class="browsing">
        <div id="chart-prev" class="img-prev-arrow" title="${msg("label.previous")}"></div>
        <div id="chart-next" class="img-next-arrow" title="${msg("label.next")}"></div>
      </div>
      <div id="${el}-chart-container" class="chart-container">
        <div class="chart" id="${el}-chart"></div>
      </div>
    </div>

    <table id="popularity-table">
      <tr>
        <td class="table-bottom">
          <div id="${el}-mostread-container">
            <div  id="${el}-mostread"></div>
          </div>
        </td>
        <td class="table-bottom">
          <div id="${el}-mostupdated-container">
            <div id="${el}-mostupdated"></div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</div>