// NOTE: These are taken from the npm packages `slugid` and `uuid-parse`
// - `uuid-parse` is now not supported
// - newer versions of `slugid` do not have uuid-parse built-in, which appears
//   to have a different spec
const encode = function(uuid_) {
  var bytes   = parse(uuid_);
  var base64  = (new Buffer(bytes)).toString('base64');
  var slug = base64
              .replace(/\+/g, '-')  // Replace + with - (see RFC 4648, sec. 5)
              .replace(/\//g, '_')  // Replace / with _ (see RFC 4648, sec. 5)
              .substring(0, 22)     // Drop '==' padding
  return slug
}

var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

function parse(s, buf, offset) {
  var i = (buf && offset) || 0;
  var ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

export async function POST(req) {
  const BASE_URL = 'https://samus.link'
  const settings = await req.json()
  const generateUrl = new URL('/api/randomizers/smz3/generate', BASE_URL)
  const gameReq = await fetch(generateUrl.toString(), {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  })
  const data = await gameReq.json()
  const guid = data.guid
  const id = encode(guid)
  const seedUrl = new URL(`/seed/${id}`, BASE_URL)
  return new Response(seedUrl.toString(), {
    status: 307
  })
}