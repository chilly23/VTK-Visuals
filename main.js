// import vtkFullScreenRenderWindow from "https://unpkg.com/vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow.js";
// import vtkPolyDataReader from "https://unpkg.com/vtk.js/Sources/IO/Legacy/PolyDataReader.js";
// import vtkMapper from "https://unpkg.com/vtk.js/Sources/Rendering/Core/Mapper.js";
// // import vtkActor from "https://unpkg.com/vtk.js/Sources/Rendering/Core/Actor.js";
// import vtkColorTransferFunction from "https://unpkg.com/vtk.js/Sources/Rendering/Core/ColorTransferFunction.js";
// import vtkContourFilter from "https://unpkg.com/vtk.js/Sources/Filters/General/ContourFilter.js";
// import vtkPlane from "https://unpkg.com/vtk.js/Sources/Common/DataModel/Plane.js";
// import vtkCutter from "https://unpkg.com/vtk.js/Sources/Filters/Core/Cutter.js";
let originalData;

const fullScreenRenderer =
  vtk.Rendering.Misc.vtkFullScreenRenderWindow.newInstance({
    rootContainer: document.getElementById("container"),
  });

const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

const mapper = vtk.Rendering.Core.vtkMapper.newInstance();
const actor = vtk.Rendering.Core.vtkActor.newInstance();

actor.setMapper(mapper);
renderer.addActor(actor);

// 🔹 Load Data
async function loadData() {
  const res = await fetch("./topology.vtk");
  const buffer = await res.arrayBuffer();

  const reader = vtk.IO.Legacy.vtkPolyDataReader.newInstance();
  reader.parseAsArrayBuffer(buffer);

  originalData = reader.getOutputData();

  applyColor(originalData);
}

function applyColor(data) {
  mapper.setInputData(data);

  const lut =
    vtk.Rendering.Core.vtkColorTransferFunction.newInstance();

  lut.addRGBPoint(0, 0, 0, 1);
  lut.addRGBPoint(1, 1, 0, 0);

  mapper.setLookupTable(lut);
  mapper.setScalarModeToUsePointFieldData();

  renderer.resetCamera();
  renderWindow.render();
}

loadData();

// 🔹 Contour
window.applyContour = function () {
  const contour =
    vtk.Filters.General.vtkContourFilter.newInstance();

  contour.setInputData(originalData);
  contour.setValue(0, 0.5);

  mapper.setInputConnection(contour.getOutputPort());
  renderWindow.render();
};

// 🔹 Clip
window.applyClip = function () {
  const plane =
    vtk.Common.DataModel.vtkPlane.newInstance({
      origin: [0, 0, 0],
      normal: [1, 0, 0],
    });

  const cutter =
    vtk.Filters.Core.vtkCutter.newInstance();

  cutter.setCutFunction(plane);
  cutter.setInputData(originalData);

  mapper.setInputConnection(cutter.getOutputPort());
  renderWindow.render();
};

// 🔹 Reset
window.reset = function () {
  applyColor(originalData);
};
