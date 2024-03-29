var data = [
    {
        type: "isosurface",
        x: [0,0,0,0,1,1,1,1],
        y: [0,1,0,1,0,1,0,1],
        z: [1,1,0,0,1,1,0,0],
        value: [1,2,3,4,5,6,7,8],
        isomin: 2,
        isomax: 6,
        colorscale: "Jet"
    }
];
var layout = {
    margin: {t:0, l:0, b:0},
    scene: {
        camera: {
            eye: {
                x: 1.88,
                y: -2.12,
                z: 0.96
            }
        }
    }
};
Plotly.newPlot(graphDiv, data, layout, {showSendToCloud: true});