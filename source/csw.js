var url = require('url')
  , http = require('http')
  , request = require('request')
  , domain = require('domain')
  , dom = require('xmldom').DOMParser
  , xpath = require('xpath.js')
  , sax = require('sax')
  , saxpath = require('saxpath')
  , xml2json = require('xml2json')
  ;

function jsonGet (obj, prop, def) {
  var props
    , i
    , p
    ;
  if (!obj) return def;
  props = prop.split('.');
  count = 0;
  for (i = 0; i < props.length; i++) {
    p = props[i];
    if (obj[p]) {
      obj = obj[p];
      count++;
      if (count === props.length) {
        return obj;
      }
    } else {
      return def;
    }
  }
}

function buildRequest (cswBase, startRecord, maxRecord) {
  var host = url.parse(cswBase)['host']
    , path = url.parse(cswBase)['path']
    ;

    return {
      host: host,
      path: path + 'Request=GetRecords&service=CSW&resultType=results'
        + '&elementSetName=full&startPosition=' + startRecord 
        + '&maxRecords=' + maxRecord
        + '&outputSchema=http://www.isotc211.org/2005/gmd'
        + '&typeNames=gmd:MD_Metadata&version=2.0.2' 
    }
}

function scrapeCsw (parameters, callback) {
  var saxParser = sax.createStream(true, {lowercasetags: true, trim: true})
    , searchResults = new saxpath.SaXPath(saxParser, '//csw:searchResults')
    , fullRecord = new saxpath.SaXPath(saxParser, '//gmd:MD_Metadata')
    ;

  http.get(parameters, function (res) {
    if (res.statusCode === 200) {

      res.pipe(saxParser);

      searchResults.on('match', function (xml) {
        var doc = new dom().parseFromString(xml);
        nextRecord = xpath(doc, '@nextRecord')[0].value;
      });
      
      fullRecord.on('match', function (xml) {
        var obj
          , doc
          , contact
          ;

        try {
          obj = xml2json.toJson(xml, {object: true});
          contact = jsonGet(obj, 'gmd:MD_Metadata:gmd:contact');
          doc = {};
          doc.id = jsonGet(obj, 'gmd:MD_Metadata.gmd:fileIdentifier.gco:CharacterString.$t');
          doc.contact = {};
          doc.contact.name = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString.$t');
          doc.contact.organization = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString.$t');
          doc.contact.phone = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString.$t');
          doc.contact.email = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress.gco:CharacterString.$t');
          doc.contact.address = {};
          doc.contact.address.street = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString.$t');
          doc.contact.address.city = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString.$t');
          doc.contact.address.state = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:administrativeArea.gco:CharacterString.$t');
          doc.contact.address.zip = jsonGet(contact, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString.$t');
          console.log(doc);
        } catch (err) {
          // Do something here...
        }
      });
      
      res.on('end', function () {
        console.log('end');
      });
      
      res.on('error', function (err) {
        console.log(err);
      })        
    }
  })
}

exports.buildRequest = buildRequest;
exports.scrapeCsw = scrapeCsw;