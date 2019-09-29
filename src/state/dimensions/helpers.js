import { NAVBAR_HEIGHT, SIDEBAR_WIDTH } from '../../Defaults'
export function getDimensions () {
  const width = window.innerWidth
  const height = window.innerHeight
  const centerX = Math.floor(width * 0.5)
  const centerY = Math.floor(height * 0.5)
  const maxDimension = (width < height) ? width : height
  const rootSize = Math.floor(maxDimension * 0.45)
  const rootRadius = Math.floor(rootSize * 0.5)

  const innerHeight = height - NAVBAR_HEIGHT
  const safeToMove = (width > height + SIDEBAR_WIDTH)

  return {
    width,
    height,
    innerHeight,
    safeToMove,
    centerX,
    centerY,
    maxDimension,
    rootRadius,
    rootSize
  }
}
