package com.atolcd.alfresco.web.scripts.shareStats;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.orm.ibatis.SqlMapClientTemplate;
import org.springframework.util.Assert;

import com.atolcd.alfresco.AuditCount;
import com.atolcd.alfresco.AuditEntry;
import com.atolcd.alfresco.AuditQueryParameters;

public class SelectAuditsGet extends DeclarativeWebScript implements InitializingBean {
    // SqlMapClientTemplate for ibatis calls
    private SqlMapClientTemplate sqlMapClientTemplate;

    private static final String SELECT_ALL = "alfresco.atolcd.audit.selectAll";
    private static final String SELECT_BY_VIEW = "alfresco.atolcd.audit.selectByView";
    private static final String SELECT_BY_CREATED = "alfresco.atolcd.audit.selectByCreated";
    private static final String SELECT_BY_UPDATED = "alfresco.atolcd.audit.selectByUpdated";
    private static final String SELECT_BY_DELETED = "alfresco.atolcd.audit.selectByDeleted";

    // Requete entre sites

    // logger
    private static final Log logger = LogFactory.getLog(SelectAuditsGet.class);

    public void setSqlMapClientTemplate(SqlMapClientTemplate sqlMapClientTemplate) {
        this.sqlMapClientTemplate = sqlMapClientTemplate;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.sqlMapClientTemplate);
    }

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
        try {
            // Map passé au template.
            Map<String, Object> model = new HashMap<String, Object>();

            // Check for the sqlMapClientTemplate Bean
            if (this.sqlMapClientTemplate != null) {
                // Get the input content given into the request.
                // String jsonArg = req.getContent().getContent();
                AuditQueryParameters params = buildParametersFromRequest(req);
                String type = req.getParameter("type");
                checkForQuery(model, params, type);
            }
            return model;
        } catch (Exception e) {
            e.printStackTrace();
            throw new WebScriptException("[ShareStats - SelectAudits] Error in executeImpl function");
        }
    }

    public void checkForQuery(Map<String, Object> model, AuditQueryParameters params, String type) throws SQLException,
            JSONException {
        switch (queryType.valueOf(type)) {
        /*case all:
            if (params.getSlicedDates() != null) {
                model.put("slicedDates", params.getSlicedDates());
                model.put("results", selectAllByDate(params));
            } else {
                model.put("results", selectAll(params));
            }
            break;*/
        case read:
            model.put("dates", selectByDate(params, SELECT_BY_VIEW));
            model.put("slicedDates", params.getSlicedDates());
            break;
        case created:
            model.put("dates", selectByDate(params, SELECT_BY_CREATED));
            model.put("slicedDates", params.getSlicedDates());
            break;
        case deleted:
            model.put("dates", selectByDate(params, SELECT_BY_DELETED));
            model.put("slicedDates", params.getSlicedDates());
            break;
        case updated:
            model.put("dates", selectByDate(params, SELECT_BY_UPDATED));
            model.put("slicedDates", params.getSlicedDates());
            break;
        }
        model.put("type", type);
    }

    /**
     * 
     * @return
     * @throws SQLException
     * @throws JSONException
     */
    @SuppressWarnings("unchecked")
    public List<AuditEntry> selectAll(AuditQueryParameters params) throws SQLException, JSONException {
        List<AuditEntry> auditSamples = new ArrayList<AuditEntry>();
        auditSamples = sqlMapClientTemplate.queryForList(SELECT_ALL, params);
        logger.info("Performing selectAll() ... ");
        return auditSamples;
    }

    @SuppressWarnings("unchecked")
    public List<List<AuditEntry>> selectAllByDate(AuditQueryParameters params) throws SQLException, JSONException {
        List<List<AuditEntry>> auditSamples = new ArrayList<List<AuditEntry>>();
        String[] dates = params.getSlicedDates().split(",");

        for (int i = 0; i < dates.length - 1; i++) {
            params.setDateFrom(dates[i]);
            params.setDateTo(dates[i + 1]);
            List<AuditEntry> auditSample = new ArrayList<AuditEntry>();
            auditSample = sqlMapClientTemplate.queryForList(SELECT_ALL, params);
            auditSamples.add(auditSample);
        }
        logger.info("Performing selectAllByDate() ... ");
        return auditSamples;
    }

    @SuppressWarnings("unchecked")
    public List<AuditCount> select(AuditQueryParameters params, String query) {
        List<AuditCount> auditCount = new ArrayList<AuditCount>();
        auditCount = sqlMapClientTemplate.queryForList(query, params);
        logger.info("Performing " + query + " ... ");
        return auditCount;
    }

    @SuppressWarnings("unchecked")
    public List<List<AuditCount>> selectByDate(AuditQueryParameters params, String query) {
        String[] dates = params.getSlicedDates().split(",");
        List<List<AuditCount>> auditCount = new ArrayList<List<AuditCount>>();
        for (int i = 0; i < dates.length - 1; i++) {
            params.setDateFrom(dates[i]);
            params.setDateTo(dates[i + 1]);
            List<AuditCount> auditSample = new ArrayList<AuditCount>();
            auditSample = sqlMapClientTemplate.queryForList(query, params);
            auditCount.add(auditSample);
        }
        logger.info("Performing " + query + " ... ");
        return auditCount;
    }

    public AuditQueryParameters buildParametersFromRequest(WebScriptRequest req) {
        try {
            // Probleme de long / null
            String dateFrom = req.getParameter("from");
            String dateTo = req.getParameter("to");

            AuditQueryParameters params = new AuditQueryParameters();
            params.setSiteId(req.getParameter("site"));
            params.setSitesId(req.getParameter("sites"));
            params.setActionName(req.getParameter("action"));
            params.setAppName(req.getParameter("module"));
            params.setDateFrom(dateFrom);
            params.setDateTo(dateTo);
            params.setSlicedDates(req.getParameter("dates"));
            return params;
        } catch (Exception e) {
            logger.error("Erreur lors de la construction des parametres [select.java]");
            e.printStackTrace();
            return null;
        }
    }
}