var csvData;
d3.csv("data/love_lines.csv").then(data => {
    csvData = data;
    // loop through all matching SVG elements by ID
    data.forEach(d => {
        const shape = d3.select(`#${d.id}`);

        if (!shape.empty()) {
            shape.style("display", "block");

            // add tooltip events
            shape
                .on("mouseover", function (event) {
                    console.log("Hovered on", d.id, d.tooltip, event.pageX, event.pageY);
                    tooltip_love
                        .style("opacity", 1)
                        .html(d.tooltip)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mousemove", function (event) {
                    tooltip_love
                        .style("opacity", 1)
                        .html(d.tooltip)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function () {
                    tooltip_love.style("opacity", 0);
                });
        }
    });
});

// tooltip div
const tooltip_love = d3.select("body").append("div")
    .attr("class", "tooltip_love")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("max-width", "25vw")
    .style("pointer-events", "none")
    .style("font-size", "0.9rem")
    .style("font-family", "American Typewriter")
    .style("border-radius", "4px");


let toggleActive = false; // false means "everything visible"

d3.select("#toggle-hidden").on("click", () => {
    toggleActive = !toggleActive;
    csvData.forEach(d => {
        const shape = d3.select(`#${d.id}`);
        if (!shape.empty()) {
            const shouldShow = d.show.toLowerCase() === "true";
            shape.style("display", !toggleActive || shouldShow ? "block" : "none");
        }
    });
});