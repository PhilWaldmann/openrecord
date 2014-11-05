require('./__helper');

testActiveDirectory('exec', [ //TODO: base independent... should be via AD_BASE EVNT var...
  {dn:'ou=openrecord, dc=dabeach, dc=lan', name:'openrecord', objectClass:['top', 'organizationalUnit']},
  {dn:'ou=zuzu, ou=openrecord, dc=dabeach, dc=lan', name:'zuuuu', objectClass:['top', 'organizationalUnit']},
  {dn:'ou=max, ou=openrecord, dc=dabeach, dc=lan', name:'max', objectClass:['top', 'organizationalUnit']}
]);