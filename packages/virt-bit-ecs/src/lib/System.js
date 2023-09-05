/**
 * Defines a new system function.
 *
 * @param {function} update
 * @returns {function}
 */
 export const defineSystem = (update) => (world, state, network_packets) => {
  return update(world, state, network_packets)
}
