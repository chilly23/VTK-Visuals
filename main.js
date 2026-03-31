import vtkFullScreenRenderWindow from "https://unpkg.com/vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow.js";
import vtkPolyDataReader from "https://unpkg.com/vtk.js/Sources/IO/Legacy/PolyDataReader.js";
import vtkMapper from "https://unpkg.com/vtk.js/Sources/Rendering/Core/Mapper.js";
import vtkActor from "https://unpkg.com/vtk.js/Sources/Rendering/Core/Actor.js";
import vtkColorTransferFunction from "https://unpkg.com/vtk.js/Sources/Rendering/Core/ColorTransferFunction.js";
import vtkContourFilter from "https://unpkg.com/vtk.js/Sources/Filters/General/ContourFilter.js";
import vtkPlane from "https://unpkg.com/vtk.js/Sources/Common/DataModel/Plane.js";
import vtkCutter from "https://unpkg.com/vtk.js/Sources/Filters/Core/Cutter.js";

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  rootContainer: document.getElementById("container"),
});

const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

let originalData;
let mapper = vtkMapper.newInstance();
let actor = vtkActor.newInstance();

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
  const contour = vtkContourFilter.newInstance();
  contour.setInputData(originalData);
  contour.setValue(0, 0.5);

  mapper.setInputConnection(contour.getOutputPort());
  renderWindow.render();
};


// 🔹 Clip / Slice
window.applyClip = function () {
  const plane = vtkPlane.newInstance({
    origin: [0, 0, 0],
    normal: [1, 0, 0],
  });

  const cutter = vtkCutter.newInstance();
  cutter.setCutFunction(plane);
  cutter.setInputData(originalData);

  mapper.setInputConnection(cutter.getOutputPort());
  renderWindow.render();
};


// 🔹 Reset
window.reset = function () {
  applyColor(originalData);
};