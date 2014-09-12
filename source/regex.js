module.exports = {
  fileId: /<gmd:fileIdentifier><gco:CharacterString>(.*?)<\/gco:CharacterString><\/gmd:fileIdentifier>/g,
  contact: {
    name: /<gmd:contact><gmd:CI_ResponsibleParty><gmd:individualName><gco:CharacterString>(.*?)<\/gmd:contact><\/gmd:CI_ResponsibleParty><\/gmd:individualName><\/gco:CharacterString>/g,
    org: /<gmd:contact><gmd:CI_ResponsibleParty><gmd:organisationName><gco:CharacterString>(.*?)<\/gmd:contact><\/gmd:CI_ResponsibleParty><\/gmd:organisationName><\/gco:CharacterString>/g,
    phone: 
  }
  identity: /<gmd:identificationInfo>(.*?)<\/gmd:identificationInfo>/g,
  distrib: /<gmd:distributionInfo>(.*?)<\/gmd:distributionInfo>/g
};