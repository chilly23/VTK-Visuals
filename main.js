import vtkFullScreenRenderWindow from "https://unpkg.com/vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow.js";
import vtkPolyDataReader from "https://unpkg.com/vtk.js/Sources/IO/Legacy/PolyDataReader.js";
import vtkMapper from "https://unpkg.com/vtk.js/Sources/Rendering/Core/Mapper.js";
// import vtkActor from "https://unpkg.com/vtk.js/Sources/Rendering/Core/Actor.js";
import vtkColorTransferFunction from "https://unpkg.com/vtk.js/Sources/Rendering/Core/ColorTransferFunction.js";
import vtkContourFilter from "https://unpkg.com/vtk.js/Sources/Filters/General/ContourFilter.js";
import vtkPlane from "https://unpkg.com/vtk.js/Sources/Common/DataModel/Plane.js";
import vtkCutter from "https://unpkg.com/vtk.js/Sources/Filters/Core/Cutter.js";

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
  const res = await fetch("Topology (1).vtk");
  const buffer = await res.arrayBuffer();

  const reader = vtkPolyDataReader.newInstance();
  reader.parseAsArrayBuffer(buffer);

  originalData = reader.getOutputData();

  applyColor(originalData);
}

function applyColor(data) {
  mapper.setInputData(data);

  const lut = vtkColorTransferFunction.newInstance();
  lut.addRGBPoint(0, 0, 0, 1);
  lut.addRGBPoint(1, 1, 0, 0);

  mapper.setLookupTable(lut);
  mapper.setColorByArrayName("Scalars");
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


// 🔹 Clip / Slice
window.applyClip = function () {  
const plane =
  vtk.Common.DataModel.vtkPlane.newInstance();


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