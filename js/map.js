// Interactive map of settings of highest grossing romcoms
const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const mapGroup = svg.append("g");

const projection = d3.geoNaturalEarth1()
    .scale(160)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);
const tooltip = d3.select("#details");

// bar chart svg
const barSvg = d3.select("#bar-chart");
const margin = { top: 30, right: 20, bottom: 100, left: 200};
const chartWidth = +barSvg.attr("width") - margin.left - margin.right;
const chartHeight = +barSvg.attr("height") - margin.top - margin.bottom;

const barG = barSvg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let bars; // For the rect elements
let topLocations;

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("data/map_top25.csv", d => ({
        ...d,
        longitude: +d.longitude,
        latitude: +d.latitude,
        rank: +d.rank
    }))
]).then(([worldData, movieData]) => {
    let countries = topojson.feature(worldData, worldData.objects.countries).features;
    countries = countries.filter(d => d.properties.name !== "Antarctica");

    const locationMap = d3.group(movieData, d => `${d.latitude},${d.longitude}`);
    const uniqueCoords = Array.from(locationMap.keys());
    const colorScale = d3.scaleOrdinal()
        .domain(uniqueCoords)
        .range(d3.schemePaired.concat(d3.schemeObservable10));

    let lockedCoord = null;

    mapGroup.append("g")
        .selectAll("path")
        .data(countries)
        .join("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", "none")
        .attr("stroke", "#3f3217")
        .attr("stroke-width", 1);

    const movieGroups = d3.groups(movieData, d => d.title);
    const arcs = movieGroups
        .filter(([, locs]) => locs.length > 1)
        .flatMap(([title, locs]) => d3.pairs(locs).map(([a, b]) => ({ movie: title, source: a, target: b })));

    const arcGroup = mapGroup.append("g").attr("class", "arc-group");

    arcGroup.selectAll("path")
        .data(arcs)
        .join("path")
        .attr("d", d => {
            const [x1, y1] = projection([d.source.longitude, d.source.latitude]);
            const [x2, y2] = projection([d.target.longitude, d.target.latitude]);
            const dx = x2 - x1, dy = y2 - y1;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
            return `M${x1},${y1}A${dr},${dr} 0 0,1 ${x2},${y2}`;
        })
        .attr("stroke", "#888")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("class", "arc")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .attr("stroke", "#f3c619")
                .attr("stroke-width", 2);

            const srcClass = `point-${d.source.latitude}-${d.source.longitude}`.replace(/[.,]/g, "-");
            const tgtClass = `point-${d.target.latitude}-${d.target.longitude}`.replace(/[.,]/g, "-");

            d3.selectAll(`.${srcClass}, .${tgtClass}`)
                .attr("r", 7)
                .attr("fill", "#f3c619");

            tooltip
                .style("opacity", 1)
                .html(`
                        <strong>${d.movie}</strong><br>
                        <div>Location 1: ${d.source.city}, ${d.source.country}</div>
                        <div>Location 2: ${d.target.city}, ${d.target.country}</div>
                    `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .attr("stroke", "#888")
                .attr("stroke-width", 1);

            const srcClass = `point-${d.source.latitude}-${d.source.longitude}`.replace(/[.,]/g, "-");
            const tgtClass = `point-${d.target.latitude}-${d.target.longitude}`.replace(/[.,]/g, "-");

            d3.selectAll(`.${srcClass}, .${tgtClass}`)
                .attr("r", 3.5)
                .attr("fill", "#0a3f87")


            tooltip.style("opacity", 0);
        });

    mapGroup.append("g")
        .selectAll("circle")
        .data(Array.from(locationMap.entries()))
        .join("circle")
        .attr("cx", ([coord]) => {
            const [lat, lon] = coord.split(",").map(Number);
            return projection([lon, lat])[0];
        })
        .attr("cy", ([coord]) => {
            const [lat, lon] = coord.split(",").map(Number);
            return projection([lon, lat])[1];
        })
        .attr("r", ([, movies]) => {
            const r = Math.sqrt(movies.length) * 5;
            return r;
        })
        .attr("data-base-radius", ([, movies]) => Math.sqrt(movies.length) * 3.5)
        .attr("fill", ([coord]) => colorScale(coord))
        .attr("fill-opacity", 0.9)
        .attr("stroke", "#3f3217")
        .attr("stroke-width", 1)
        .attr("class", ([coord]) => `movie-point point-${coord.replace(/[,]/g, "-")}`)
        .on("mouseover", (event, [coord, movies]) => {
            const html = movies.map(d => {
                const location = d.state ? `${d.city}, ${d.state}, ${d.country}` : `${d.city}, ${d.country}`;
                return `
                    <div style="display: flex; align-items: center; margin-bottom: 0.8em;">
                        <img src="${d.posterURL}" style="width: 80px; height: auto; margin-right: 1em; flex-shrink: 0;" />
                        <div>
                            <strong>${d.title}</strong> (${d.year})<br>
                            Rank: ${d.rank}<br>
                            <div class="setting-line">Setting: ${location}</div>
                            Lifetime Gross: ${d.gross}
                        </div>
                    </div>`;
            }).join("");
            tooltip
                .style("opacity", 1)
                .html(html)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })


    // Zooming and viewport centering
    const points = movieData.map(d => [d.longitude, d.latitude]);
    const geoPoints = {
        type: "FeatureCollection",
        features: points.map(coord => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: coord }
        }))
    };
    const bounds = path.bounds(geoPoints);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    const scale = Math.min(width / dx, height / dy) * 0.8;
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    const zoom = d3.zoom()
        .scaleExtent([1, 20])
        .on("zoom", (event) => {
            const k = event.transform.k;
            mapGroup.attr("transform", event.transform);
            mapGroup.selectAll("circle")
                .attr("r", function () {
                    const baseR = +d3.select(this).attr("data-base-radius");
                    return baseR / Math.pow(k, 0.75);
                })
                .attr("stroke-width", 1 / Math.pow(k, 0.5));
            mapGroup.selectAll(".country")
                .attr("stroke-width", 1 / Math.pow(k, 0.5));
            mapGroup.selectAll(".arc")
                .attr("stroke-width", 1 / Math.pow(k, 0.7));
        });

    const adjustedScale = scale * 0.55;
    const adjustedTranslate = [translate[0] + 100, translate[1] + 100];

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(adjustedTranslate[0], adjustedTranslate[1]).scale(adjustedScale));

    // === Build bar chart ===
    const locationCounts = d3.rollup(
        movieData,
        v => v.length,
        d => d.state ? `${d.city}, ${d.state}, ${d.country}` : `${d.city}, ${d.country}`
    );

    const locationArray = Array.from(locationCounts, ([location, count]) => ({ location, count }));
    locationArray.sort((a, b) => b.count - a.count);
    const topLocations = locationArray.slice(0, 6);

    const xBar = d3.scaleLinear()
        .domain([0, d3.max(topLocations, d => d.count)])
        .range([0, chartWidth]);

    const yBar = d3.scaleBand()
        .domain(topLocations.map(d => d.location))
        .range([0, chartHeight])
        .padding(0.2);

    barG.append("g")
        .call(d3.axisLeft(yBar))
        .selectAll("text")
        .style("font-size", "0.85rem")
        .style("fill", "#333")
        .attr("text-anchor", "end")
        .attr("dx", "-0.5em"); 

    barG.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xBar).ticks(5))
        .selectAll("text")
        .style("font-size", "0.85rem")
        .style("fill", "#333");

    barG.append("text")
        .attr("x", chartWidth / 2)  // a bit left of the left bar
        .attr("y", chartHeight + 55)
        .attr("text-anchor", "middle")
        .style("font-size", "0.95rem")
        .style("fill", "#55524f")
        .text("Occurences in top 50 highest grossing rom-coms");

    const barColors = ["#ed2875", "#fd7b0f", "#ffbf00", "#86b54a", "#38dbe7", "#ca58c1"];

    bars = barG.selectAll("rect")
        .data(topLocations)
        .join("rect")
        .attr("y", d => yBar(d.location))
        .attr("height", yBar.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", (d, i) => barColors[i % barColors.length]);

    // === Animate bars on scroll ===
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                bars.transition()
                    .duration(800)
                    .attr("width", d => xBar(d.count));
                observer.disconnect(); // Only animate once
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(document.querySelector("#bar-chart"));

});


