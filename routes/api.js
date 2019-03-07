/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
    app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
        if(err)
          return res.send(err);
        
        // Create the query:
        let query = req.query;
        
        // Parse string booleans to boolean:
        if(query.open)
          query.open = query.open === 'true';
        
        // Add project name to the query:
        query.project_name = project;
        
        db = db.db('issueTracker');
        db.collection('issues').find(
          query,
          {}
        ).toArray((err, docs) => {
          return res.json(docs);
        });
      });
    })
    
    .post(function (req, res){
      var project = req.params.project;
      
      if((!req.body.issue_title || req.body.issue_title.trim() === '')
        || (!req.body.issue_text || req.body.issue_text.trim() === '')
        || (!req.body.created_by || req.body.created_by.trim() === ''))
        return res.send("Please fill the form.");
      
      MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
        if(err)
          return res.send(err);
        
        db = db.db('issueTracker');
        let new_issue = {
          project_name: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        }
        db.collection('issues').insertOne(
          new_issue, {},
          (err, doc) => {
            if(err)
              return res.send(err);

            return res.json(doc.ops[0]);
          });
      });
    })
    
    .put(function (req, res){
      var project = req.params.project;
      
      // Required field:
      if(!req.body._id || req.body._id.trim() === '')
        return res.send("Please fill the form _id.");
      
      MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
        if(err)
          return res.send(err);
        
        db = db.db('issueTracker');
        
        // Get fields to update:
        var toEdit = {};
        if(req.body.open)
          toEdit.open = req.body.open === 'true';
        if(req.body.issue_title && req.body.issue_title.trim() !== '')
          toEdit.issue_title = req.body.issue_title;
        if(req.body.issue_text && req.body.issue_text.trim() !== '')
          toEdit.issue_text = req.body.issue_text;
        if(req.body.created_by && req.body.created_by.trim() !== '')
          toEdit.created_by = req.body.created_by;
        if(req.body.assigned_to && req.body.assigned_to.trim() !== '')
          toEdit.assigned_to = req.body.assigned_to;
        if(req.body.status_text && req.body.status_text.trim() !== '')
          toEdit.status_text = req.body.status_text;
        toEdit.updated_on = new Date();
        
        // Find and update the document:
        db.collection('issues').findOneAndUpdate(
          { _id: MongoClient.ObjectId(req.body._id) },
          { $set: toEdit },
          { returnOriginal: false },
          (err, doc) => {
            if(err)
              return res.send(err);
            
            // Don't show the project name:
            delete doc.value.project_name;
            
            return res.json(doc.value);
          });
      });
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
      // Required field:
      if(!req.body._id || req.body._id.trim() === '')
        return res.send("Please fill the form _id.");
      
      MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, db) {
        if(err)
          return res.send(err);
        
        db = db.db('issueTracker');
        
        db.collection('issues').deleteOne(
          { _id: MongoClient.ObjectId(req.body._id) },
          {}, (err, doc) => {
          if(err)
            return res.send(`Could not delete ${req.body._id}`);

          return res.send(`Deleted ${req.body._id}`);
        })
      });
    });
};
