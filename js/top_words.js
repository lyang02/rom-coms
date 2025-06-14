const tw_margin = { top: 40, right: 40, bottom: 40, left: 40 };
const barHeight = 35;
const gap = 120;

d3.csv("data/top_words.csv", d3.autoType).then(rawData => {
    rawData.forEach(d => {
        d.total = d.F + d.M;
    });

    let sortMode = "total";
    render(sortMode);

    d3.select("#sort-mode").on("change", function () {
        sortMode = this.value;
        render(sortMode);
    });

    function render(mode) {
        let tw_data;

        if (mode === "total") {
            tw_data = [...rawData].sort((a, b) => b.total - a.total).slice(0, 40);
        } else if (mode === "shared") {
            tw_data = rawData.filter(d => d.shared).sort((a, b) => b.total - a.total).slice(0, 20);
        } else if (mode === "unique") {
            tw_data = rawData.filter(d => !d.shared).sort((a, b) => b.total - a.total).slice(0, 20);
        }

        const tw_width = document.querySelector("#top-words").clientWidth - tw_margin.left - tw_margin.right;
        const tw_height = tw_data.length * barHeight + tw_margin.top + tw_margin.bottom;
        const centerX = tw_width / 2;

        const svg = d3.select("#top-words-bars")
            .attr("width", tw_width + tw_margin.left + tw_margin.right)
            .attr("height", tw_height);

        svg.selectAll("*").remove();

        const tw_g = svg.append("g")
            .attr("transform", `translate(${tw_margin.left},${tw_margin.top})`);

        const y = d3.scaleBand()
            .domain(tw_data.map(d => d.word))
            .range([0, tw_height - tw_margin.top - tw_margin.bottom])
            .padding(0.2);  // add spacing between bars

        const maxCount = d3.max(tw_data, d => Math.max(d.F, d.M));
        const maxBarWidth = (tw_width - gap) / 2;

        const x = d3.scaleLinear()
            .domain([0, maxCount])
            .range([0, maxBarWidth]);

        // Axis
        tw_g.append("g")
            .attr("class", "tw-y-axis")
            .attr("transform", `translate(${centerX}, 0)`)
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
            .call(g => g.select(".domain").remove())
            .selectAll("text")
            .style("font-size", "1.1rem")
            .attr("text-anchor", "middle");

        const bars = tw_g.selectAll(".tw-bar-group")
            .data(tw_data, d => d.word)
            .join(enter => {
                const g = enter.append("g").attr("class", "tw-bar-group");
                g.append("rect").attr("class", "tw-bar-female").attr("fill", "#ca58c1");
                g.append("rect").attr("class", "tw-bar-male").attr("fill", "#86b54a");
                g.append("text").attr("class", "tw-label-female");
                g.append("text").attr("class", "tw-label-male");
                return g;
            });

        bars.attr("transform", d => `translate(${centerX}, ${y(d.word)})`)
        .on("mouseover", function (event, d) {
            const group = d3.select(this);
          
            const femaleBar = group.select(".tw-bar-female");
            if (!femaleBar.empty()) {
              femaleBar.attr("fill", "#ffbf00");
            }
          
            const maleBar = group.select(".tw-bar-male");
            if (!maleBar.empty()) {
              maleBar.attr("fill", "#ffbf00");
            }
          })
            .on("mouseout", function (event, d) {
                d3.select(this).select(".tw-bar-female").attr("fill", "#ca58c1");
                d3.select(this).select(".tw-bar-male").attr("fill", "#86b54a");
            });

        // Female bars
        bars.select(".tw-bar-female")
            .attr("x", d => -x(d.F) - gap / 2 - 10)
            .attr("width", d => x(d.F))
            .attr("height", y.bandwidth())
            .attr("y", 0);

        // Male bars
        bars.select(".tw-bar-male")
            .attr("x", gap / 2)
            .attr("width", d => x(d.M))
            .attr("height", y.bandwidth())
            .attr("y", 0);

        // Labels
        bars.select(".tw-label-female")
            .text(d => d.F > 0 ? d.F : "")
            .attr("x", d => -x(d.F) - gap / 2 - 20)
            .attr("y", y.bandwidth() / 2 + 5)
            .attr("text-anchor", "end")
            .style("fill", "#55524f");

        bars.select(".tw-label-male")
            .text(d => d.M > 0 ? d.M : "")
            .attr("x", d => x(d.M) + gap / 2 + 8)
            .attr("y", y.bandwidth() / 2 + 5)
            .attr("text-anchor", "start")
            .style("fill", "#55524f");

        tw_g.append("text")
            .attr("x", centerX - gap / 2 - 60)  // a bit left of the left bar
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "1.2rem")
            .style("fill", "#ca58c1")
            .text("Female");

        tw_g.append("text")
            .attr("x", centerX + gap / 2 + 60)  // a bit right of the right bar
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "1.15rem")
            .style("fill", "#86b54a")
            .text("Male");
    }
});