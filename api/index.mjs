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

const DEFAULT_SETTINGS = {
  "smlogic": "normal",
  "goal": "defeatboth",
  "opentower": "sevencrystals",
  "ganonvulnerable": "sevencrystals",
  "opentourian": "fourbosses",
  "swordlocation": "randomized",
  "morphlocation": "randomized",
  "keyshuffle": "none",
  "seed": null,
  "race": true,
  "gamemode": "normal",
  "players": 1,
  "initialitems": "Boots"
}

async function generateSeed(opts) {
  const settings = { ...DEFAULT_SETTINGS, opts }
  const BASE_URL = 'https://samus.link'
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
  return { ...data, seedUrl: seedUrl.toString() }
}

export async function GET() {
  const seed = await generateSeed()
  return new Response(seed.seedUrl, {
    status: 307,
    headers: {
      Location: seed.seedUrl
    }
  })
}

export async function POST(req) {
  const settings = await req.json()
  const seed = await generateSeed(settings)
  return new Response(seed.seedUrl, {
    status: 307,
    headers: {
      Location: seed.seedUrl
    }
  })
}