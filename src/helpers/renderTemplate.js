const path = require('path');
const ejs = require('ejs');

const renderTemplate = async (templateName, data) => {
  const filePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.ejs`);
  return ejs.renderFile(filePath, data);
};

module.exports = renderTemplate;