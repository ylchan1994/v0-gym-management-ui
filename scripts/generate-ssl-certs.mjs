import mkcert from 'mkcert';

const generate = async () => {
  const ca = await mkcert.createCA({
    organization: 'Gym Management Dev CA',
    countryCode: 'US',
    state: 'California',
    locality: 'San Francisco',
    validityDays: 365
  });

  const cert = await mkcert.createCert({
    domains: ['127.0.0.1', 'localhost'],
    validityDays: 365,
    ca: {
      key: ca.key,
      cert: ca.cert
    }
  });

  return cert;
};

generate().then(cert => {
  console.log('Certificate and key generated successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Error generating certificate:', err);
  process.exit(1);
});