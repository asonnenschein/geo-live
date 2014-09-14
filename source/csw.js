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

function buildContact (obj) {
  contact = {};
  contact.name = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString');
  contact.organization = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString');
  contact.phone = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString');
  contact.email = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress.gco:CharacterString');
  contact.address = {};
  contact.address.street = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString');
  contact.address.city = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString');
  contact.address.state = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:administrativeArea.gco:CharacterString');
  contact.address.zip = jsonGet(obj, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString');
  return contact;
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
          , metaContact
          , ident
          , resParties
          , resParty
          , descKeywords
          , descKeyword
          , keywords
          , keyword
          , words
          , split
          , word
          , extent
          , distributors
          , distributor
          , distributions
          , distribution
          , linkLookup
          , id
          ;

        try {
          obj = xml2json.toJson(xml, {object: true});
          
          function onlineResource (distOption) {
            return jsonGet(distOption, 'gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource');
          }
          function getDistributorLink (dist) {
            var id = dist['xlink:href'].replace('#', '');
            return linkLookup[id];
          }
          function buildLink (onlineResource, responsibleParty) {
            var url
              , protocol
              , link
              , guess
              , serviceType
              , name
              ;

            url = jsonGet(onlineResource, 'gmd:linkage.gmd:URL');
            protocol = jsonGet(onlineResource, 'gmd:protocol.gco:CharacterString');
            protocol = protocol.toUpperCase();
          }

          doc = {};

          doc.id = jsonGet(obj, 'gmd:MD_Metadata.gmd:fileIdentifier.gco:CharacterString');

          metaContact = jsonGet(obj, 'gmd:MD_Metadata.gmd:contact');
          doc.MetadataContact = buildContact(metaContact);
          
          ident = jsonGet(obj, 'gmd:MD_Metadata.gmd:identificationInfo');
          ident = jsonGet(ident, '0', ident);
          ident = jsonGet(ident, 'gmd:MD_DataIdentification');
          
          doc.title = jsonGet(ident, 'gmd:citation.gmd:CI_Citation.gmd:title.gco:CharacterString');
          doc.description = jsonGet(ident, 'gmd:abstract.gco:CharacterString');
          resParties = jsonGet(ident, 'gmd:citation.gmd:CI_Citation.gmd:citedResponsibleParty', []);
          
          if (resParties['gmd:CI_ResponsibleParty']) {
            resParties = [resParties];
          }
          
          doc.Authors = [];
          for (i = 0; i < resParties.length; i++) {
            resParty = resParties[i];
            doc.Authors.push(buildContact(resParty));
          }

          doc.Keywords = [];
          descKeywords = jsonGet(ident, 'gmd:descriptiveKeywords', []);
          if (descKeywords['gmd:MD_Keywords']) {
            descKeywords = [descKeywords];
          }
          for (j = 0; j < descKeywords.length; j++) {
            descKeyword = descKeywords[i];
            keywords = jsonGet(descKeyword, 'gmd:MD_Keywords.gmd:keyword', []);
            if (keywords['gco:CharacterString']) {
              keywords = [keywords];
            }
            for (k = 0; k < keywords.length; k++) {
              keyword = keywords[k];
              words = jsonGet(keyword, 'gco:CharacterString', null);
              split = words.split(',');
              for (l = 0; l < split.length; l++) {
                word = split[l];
                doc.Keywords.push(word.trim());
              }
            }
          }

          extent = jsonGet(ident, 'gmd:extent');
          doc.GeographicExtent = {};
          doc.GeographicExtent.NorthBound = parseFloat(jsonGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:northBoundLatitude.gco:Decimal'));
          doc.GeographicExtent.SouthBound = parseFloat(jsonGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:southBoundLatitude.gco:Decimal'));
          doc.GeographicExtent.EastBound = parseFloat(jsonGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:eastBoundLongitude.gco:Decimal'));
          doc.GeographicExtent.WestBound = parseFloat(jsonGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:westBoundLongitude.gco:Decimal'));

          doc.Distributors = [];
          distributors = jsonGet(obj, 'gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor', []);
          if (distributors['gmd:MD_Distributor']) {
            distributors = [distributors];
          }
          for (m = 0; m < distributors.length; m++) {
            distributor = distributors[m];
            doc.Distributors.push(buildContact(jsonGet(distributor, 'gmd:MD_Distributor.gmd:distributorContact')));
          }
          distributions = jsonGet(obj, 'gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:transferOptions');
          if (distributions['gmd:MD_DigitalTransferOptions']) {
            distributions = [distributions];
          }
          linkLookup = {};
          for (n = 0; n < distributions.length; n++) {
            distribution = distributions[n];
            id = jsonGet(distribution, 'gmd:MD_DigitalTransferOptions.id');
            linkLookup[id] = distribution;
          }
          for (o = 0; o < distributors.length; o++) {
            isoDist = distributors[o];
            distOptions = jsonGet(isoDist, 'gmd:MD_Distributor.gmd:distributorTransferOptions', []);
            if (distOptions['gmd:MD_DigitalTransferOptions'] || distOptions['xlink:href']) {
              distOptions = [distOptions];
            }
            distOutput = [];
            for (p = 0; p < distOptions.length; p++) {
              dist = distOptions[p];
              if (dist['xlink:href']) {
                distOutput.push(getDistributorLink(dist));
              } else {
                distOutput.push(dist);
              }
            }
            responsibleParty = jsonGet(isoDist, 'gmd:MD_Distributor.gmd:distributorContact');
            distributorLinks = [];
            for (q = 0; q < distOutput.length; q++) {
              distOpt = distOutput[q];
              distributorLinks.push(buildLink(onlineResource(distOpt), responsibleParty));
            }
          }

          console.log(doc);
        } catch (err) {
          //console.log(err);
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