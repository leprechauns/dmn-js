'use strict';

var Modeler = require('../../lib/Modeler');

var ComboBox = require('table-js/lib/features/combo-box');

var simpleXML = require('../fixtures/dmn/simple.dmn'),
    emptyDefsXML = require('../fixtures/dmn/empty-definitions.dmn');


describe('Modeler', function() {

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });


  function createModeler(xml, done) {
    var modeler = new Modeler({ container: container });

    modeler.importXML(xml, function(err, warnings) {
      done(err, warnings, modeler);
    });

    return modeler;
  }


  it('should import simple process', function(done) {
    createModeler(simpleXML, done);
  });


  it('should import empty definitions', function(done) {
    createModeler(emptyDefsXML, done);
  });


  it('should re-import simple process', function(done) {

    // given
    createModeler(simpleXML, function(err, warnings, modeler) {

      if (err) {
        return done(err);
      }

      // when
      // mimic re-import of same diagram
      modeler.importXML(simpleXML, function(err, warnings) {

        // then
        expect(err).to.eql(null);
        expect(warnings.length).to.eql(0);

        done();
      });

    });
  });

  describe('defaults', function() {

    it('should use <body> as default parent', function(done) {

      var modeler = new Modeler();

      modeler.importXML(simpleXML, function(err, warnings) {

        expect(modeler.container.parentNode).to.eql(document.body);

        done(err, warnings);
      });
    });

  });


  describe('import events', function() {

    it('should fire <import.*> events', function(done) {

      // given
      var modeler = new Modeler({ container: container });

      var events = [];

      modeler.on('import.start', function() {
        events.push('import.start');
      });

      modeler.on('import.success', function() {
        events.push('import.success');
      });

      modeler.on('import.error', function() {
        events.push('import.error');
      });

      // when
      modeler.importXML(emptyDefsXML, function(err) {

        // then
        expect(events).to.eql([
          'import.start',
          'import.success'
        ]);

        done(err);
      });
    });

  });

  describe('destruction', function() {
    it('should close open combobox dropdowns on destruction', function(done) {
      // given
      var modeler = new Modeler();

      modeler.importXML(simpleXML, function(err, warnings) {

        var options = ['LIST', 'SUM', 'MIN', 'MAX', 'COUNT'];
        var comboBox = new ComboBox({
          label: 'ComboBox',
          options: options
        });

        container.appendChild(comboBox.getNode());

        comboBox._openDropdown(options);

        // make sure the dropdown is open
        expect(document.body.contains(comboBox._dropdown)).to.be.true;

        // when
        modeler.destroy();

        // then
        expect(document.body.contains(comboBox._dropdown)).to.be.false;

        done();
      });

    });

  });

});
