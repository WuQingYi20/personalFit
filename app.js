// 获取表单和输入字段
const form = document.getElementById('workout-form');
const plankInput = document.getElementById('plank-time');
const crunchInput = document.getElementById('crunches');
const chartDiv = document.getElementById('chart');

// 初始化数据
let data = JSON.parse(localStorage.getItem('workoutData')) || [];

// 处理表单提交
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const plankTime = parseInt(plankInput.value);
    const crunches = parseInt(crunchInput.value);

    // 检查当天是否已有记录
    const existing = data.find(d => d.date === today);
    if (existing) {
        existing.plankTime = plankTime;
        existing.crunches = crunches;
    } else {
        data.push({ date: today, plankTime, crunches });
    }

    // 保存到LocalStorage
    localStorage.setItem('workoutData', JSON.stringify(data));

    // 清空输入
    form.reset();

    // 更新图表
    updateChart();
});

// D3.js 绘制图表
function updateChart() {
    // 清空之前的图表
    chartDiv.innerHTML = '';

    // 设置图表尺寸
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // 设置x和y轴
    const x = d3.scaleBand()
                .domain(data.map(d => d.date))
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => Math.max(d.plankTime, d.crunches)) + 10])
                .nice()
                .range([height, 0]);

    // 添加x轴
    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % Math.ceil(data.length / 10)))));

    // 添加y轴
    svg.append("g")
       .call(d3.axisLeft(y));

    // 绘制平板支撑柱状图
    svg.selectAll(".bar-plank")
       .data(data)
       .enter()
       .append("rect")
       .attr("class", "bar-plank")
       .attr("x", d => x(d.date))
       .attr("y", d => y(d.plankTime))
       .attr("width", x.bandwidth() / 2)
       .attr("height", d => height - y(d.plankTime))
       .attr("fill", "steelblue");

    // 绘制卷腹柱状图
    svg.selectAll(".bar-crunch")
       .data(data)
       .enter()
       .append("rect")
       .attr("class", "bar-crunch")
       .attr("x", d => x(d.date) + x.bandwidth() / 2)
       .attr("y", d => y(d.crunches))
       .attr("width", x.bandwidth() / 2)
       .attr("height", d => height - y(d.crunches))
       .attr("fill", "orange");

    // 添加图例
    svg.append("circle").attr("cx", width - 100).attr("cy", 10).attr("r", 6).style("fill", "steelblue");
    svg.append("text").attr("x", width - 90).attr("y", 10).text("平板支撑时间").style("font-size", "12px").attr("alignment-baseline","middle");

    svg.append("circle").attr("cx", width - 100).attr("cy", 30).attr("r", 6).style("fill", "orange");
    svg.append("text").attr("x", width - 90).attr("y", 30).text("卷腹次数").style("font-size", "12px").attr("alignment-baseline","middle");
}

// 初始绘图
updateChart();
