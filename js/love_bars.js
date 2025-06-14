(function loveBarChart() {
    const barSvg = d3.select("#love-bar");
    const margin = { top: 30, right: 20, bottom: 100, left: 200 };
    const chartWidth = +barSvg.attr("width") - margin.left - margin.right;
    const chartHeight = +barSvg.attr("height") - margin.top - margin.bottom;
  
    const barG = barSvg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    d3.csv("data/love_summary.csv", d3.autoType).then(data => {
      const sorted = data.sort((a, b) => b.total_love_mentions - a.total_love_mentions);
      const topCharacters = sorted.slice(0, 8);
  
      const x = d3.scaleLinear()
        .domain([0, d3.max(topCharacters, d => d.total_love_mentions)])
        .range([0, chartWidth]);
  
      const y = d3.scaleBand()
        .domain(topCharacters.map(d => d.speaker))
        .range([0, chartHeight])
        .padding(0.2);
  
      barG.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "0.85rem");
  
      barG.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .style("font-size", "0.85rem");

        barG.append("text")
        .attr("x", chartWidth / 2)  // a bit left of the left bar
        .attr("y", chartHeight + 55)
        .attr("text-anchor", "middle")
        .style("font-size", "0.95rem")
        .style("fill", "#55524f")
        .text("Word Frequency");
  
      const colors = ["#ed2875", "#fd7b0f", "#ffbf00", "#86b54a", "#38dbe7", "#ca58c1"];
  
      const bars = barG.selectAll("rect")
        .data(topCharacters)
        .join("rect")
        .attr("y", d => y(d.speaker))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .attr("fill", (d, i) => colors[i % colors.length]);
  
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            bars.transition()
              .duration(800)
              .attr("width", d => x(d.total_love_mentions));
            observer.disconnect();
          }
        });
      }, { threshold: 0.5 });
  
      observer.observe(document.querySelector("#love-bar"));
    });
  })();
