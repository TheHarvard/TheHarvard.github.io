import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

// All LineMaterial instances created by setupHiddenLine need their
// `resolution` uniform kept in sync with the canvas size, or fat lines
// render at the wrong pixel width. Track them here so the caller only
// has to make one call on init/resize instead of hunting down every
// material themselves.
const registeredLineMaterials = new Set();

export function updateHiddenLineResolution(width, height) {
  for (const mat of registeredLineMaterials) {
    mat.resolution.set(width, height);
  }
}

/**
 * Converts a mesh -- or every mesh inside a Group/Object3D (e.g. a
 * loaded gltf.scene) -- into "hidden line" rendering:
 *   - the mesh itself becomes a depth-only occluder (colorWrite: false)
 *   - coplanar-face edges are pruned once via EdgesGeometry's threshold
 *   - the remaining edges are added as a *child* of the mesh, so they
 *     automatically follow its transform with no manual syncing
 *
 * The mesh keeps its geometry, position in the scene graph, and
 * everything else about it -- only `.material` and `.renderOrder`
 * change, plus one added child. Raycasting, animation, parenting,
 * disposal via the normal scene graph, etc. all keep working normally.
 *
 * @param {THREE.Object3D} root - a Mesh, or a container (Group/Scene) of meshes
 * @param {Object} [options]
 * @param {number|string|THREE.Color} [options.color=0xff0000]
 * @param {number} [options.lineWidth=1] - in screen pixels
 * @param {number} [options.occluderRenderOrder=-100]
 * @param {number} [options.thresholdDeg=0.2] - coplanar edge prune angle
 * @returns {{
 *   meshes: Array<{mesh: THREE.Mesh, edges: LineSegments2, dispose: Function}>,
 *   setColor: Function,
 *   setLineWidth: Function,
 *   setEdgesVisible: Function,
 *   dispose: Function
 * }}
 */
export function setupHiddenLine(root, options = {}) {
  const {
    color = 0xff0000,
    lineWidth = 1,
    occluderRenderOrder = -100,
    thresholdDeg = 0.2,
  } = options;

  // Collect target meshes FIRST, then mutate. Calling convertMesh()
  // inside the traverse callback itself is what caused the infinite
  // recursion: mesh.add(edges) appends a new child *while* traverse is
  // still walking this node's children, and since LineSegments2 also
  // extends THREE.Mesh, traverse would then see the newly-added edges
  // object, treat it as another mesh to convert, add edges-of-the-edges
  // as a child of that, and so on forever.
  const targetMeshes = [];
  root.traverse((child) => {
    if (child.isMesh && !child.isLineSegments2) {
      targetMeshes.push(child);
    }
  });

  const entries = targetMeshes.map((mesh) => convertMesh(mesh));

  function convertMesh(mesh) {
    const originalMaterial = mesh.material;

    // 1. mesh itself -> depth-only occluder
    const occluderMaterial = new THREE.MeshBasicMaterial({
      colorWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    mesh.material = occluderMaterial;
    mesh.renderOrder = occluderRenderOrder;

    // 2. coplanar-pruned edges, computed once
    const edgesGeo = new THREE.EdgesGeometry(mesh.geometry, thresholdDeg);
    const lineGeo = new LineSegmentsGeometry();
    lineGeo.setPositions(edgesGeo.attributes.position.array);
    edgesGeo.dispose();

    const lineMaterial = new LineMaterial({
      color,
      linewidth: lineWidth,
      worldUnits: false, // linewidth is in screen pixels, not world units
      // Initialize with the real current size rather than a (1,1)
      // placeholder -- LineMaterial uses `resolution` to convert pixel
      // linewidth into clip-space thickness, so an uncorrected (1,1)
      // value makes every line balloon out to cover the whole screen
      // until something happens to call updateHiddenLineResolution.
      // Still call updateHiddenLineResolution on window resize (and
      // once manually if your canvas isn't full-window sized).
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });
    registeredLineMaterials.add(lineMaterial);

    const edges = new LineSegments2(lineGeo, lineMaterial);
    edges.computeLineDistances();

    // child of the mesh -> inherits its transform automatically,
    // renderOrder defaults to 0 so other occluders in the scene can
    // still legitimately hide these edges
    mesh.add(edges);

    return {
      mesh,
      edges,
      dispose() {
        mesh.remove(edges);
        edges.geometry.dispose();
        edges.material.dispose();
        registeredLineMaterials.delete(edges.material);
        mesh.material.dispose();
        mesh.material = originalMaterial;
      },
    };
  }

  return {
    meshes: entries,
    setColor(newColor) {
      entries.forEach((e) => e.edges.material.color.set(newColor));
    },
    setLineWidth(px) {
      entries.forEach((e) => (e.edges.material.linewidth = px));
    },
    setEdgesVisible(v) {
      entries.forEach((e) => (e.edges.visible = v));
    },
    dispose() {
      entries.forEach((e) => e.dispose());
    },
  };
}