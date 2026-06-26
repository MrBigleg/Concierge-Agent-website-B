const crypto = require('crypto');
const fs = require('fs');

try {
  const privateKey = fs.readFileSync('private_key.pem', 'utf8');
  const publicKey = fs.readFileSync('public_key.pem', 'utf8');

  const payload = { item: 'Michelin', quantity: 1 };
  const header = { alg: 'RS256', typ: 'JWS' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${encodedHeader}.${encodedPayload}`);
  const signature = sign.sign(privateKey, 'base64url');

  // Verify
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(`${encodedHeader}.${encodedPayload}`);
  const success = verify.verify(publicKey, signature, 'base64url');

  console.log('Offline signature validation:', success ? 'PASS' : 'FAIL');

  // Additionally verify detached JWS formatting and validation
  const detachedJws = `${encodedHeader}..${signature}`;
  const parts = detachedJws.split('.');
  if (parts.length === 3 && parts[1] === '') {
    const recoveredHeader = parts[0];
    const recoveredSignature = parts[2];
    
    const detachedVerify = crypto.createVerify('RSA-SHA256');
    detachedVerify.update(`${recoveredHeader}.${encodedPayload}`);
    const detachedSuccess = detachedVerify.verify(publicKey, recoveredSignature, 'base64url');
    console.log('Detached JWS structure and verification:', detachedSuccess ? 'PASS' : 'FAIL');
  } else {
    console.log('Detached JWS structure: FAIL');
  }
} catch (error) {
  console.error('Test execution error:', error);
  process.exit(1);
}
