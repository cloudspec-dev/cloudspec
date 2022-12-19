// import { Resource } from './schema'

// export class ForceEphemeralResources {
//   visit(node: any) {
//     if (node is Resource) {
//       node.ephemeral = true
//     }
//     for (const key in node) {
//       const value = node[key]
//       if (typeof value === 'object') {
//         this.visit(value)
//       }
//     }
//   }
// }
