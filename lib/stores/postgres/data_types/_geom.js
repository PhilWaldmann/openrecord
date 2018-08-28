module.exports = {
  // convert '(1,2)' to {x:1, y:2}
  convertPoint(str){
    if(typeof str !== 'string') return null
    const match = str.match(/^\(([0-9.]+),([0-9.]+)\)$/)
    if(match) return {x: parseFloat(match[1]), y: parseFloat(match[2])}
  },

  // convert '(1,2),(4,5)' to [{x:1, y:2},{x: 4, y: 5}]
  convertPoints: function(str){
    if(typeof str !== 'string') return null
    return str.replace(/,(\([0-9.]+,[0-9.]+\))/g, '|$1')
    .split('|')
    .map(module.exports.convertPoint)
  },

  pointToString(point){
    if(!point || typeof point !== 'object') return null
    return '(' + point.x + ',' + point.y + ')'
  },

  pointsToString(points){
    if(!points || !Array.isArray(points)) return null
    return points.map(module.exports.pointToString).join(',')
  }
}