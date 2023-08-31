function getNetlifyHost() {
  const isProduction = process.env.CONTEXT === 'production';

  if ( isProduction ) return process.env.NETLIFY_HOST;

  return process.env.DEPLOY_PRIME_URL
}


module.exports.getNetlifyHost = getNetlifyHost;