// 获取表单和输入字段
const form = document.getElementById('workout-form');
const plankSetsInput = document.getElementById('plank-sets');
const plankTimeInput = document.getElementById('plank-time');
const crunchSetsInput = document.getElementById('crunch-sets');
const crunchRepsInput = document.getElementById('crunch-reps');
const chartDiv = document.getElementById('chart');

// 初始化数据
let data = JSON.parse(localStorage.getItem('workoutData')) || [];

// 处理表单提交
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const plankSets = parseInt(plankSetsInput.value);
    const plankTime = parseInt(plankTimeInput.value);
    const crunchSets = parseInt(crunchSetsInput.value);
    const crunchReps = parseInt(crunchRepsInput.value);

    // 计算总平板时间和总卷腹次数
    const totalPlankTime = plankSets * plankTime;
    const totalCrunches = crunchSets * crunchReps;

    // 检查当天是否已有记录
    const existing = data.find(d => d.date === today);
    if (existing) {
        existing.plankSets += plankSets;
        existing.plankTime += totalPlankTime;
        existing.crunchSets += crunchSets;
        existing.crunchReps += totalCrunches;
    } else {
        data.push({ date: today, plankSets, plankTime: totalPlankTime, crunchSets, crunchReps: totalCrunches });
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

    if (data.length === 0) {
        chartDiv.innerHTML = '<p>暂无训练数据，开始记录你的进步吧！</p>';
        return;
    }

    // 设置图表尺寸
    const margin = { top: 40, right: 30, bottom: 50, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // 设置x轴
    const x = d3.scaleBand()
                .domain(data.map(d => d.date))
                .range([0, width])
                .padding(0.2);

    svg.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % Math.ceil(data.length / 10)))))
       .selectAll("text")
       .attr("transform", "rotate(-45)")
       .style("text-anchor", "end");

    // 设置y轴
    const yMax = d3.max(data, d => Math.max(d.plankTime, d.crunchReps)) + 20;
    const y = d3.scaleLinear()
                .domain([0, yMax])
                .range([height, 0]);

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
       .attr("y", d => y(d.crunchReps))
       .attr("width", x.bandwidth() / 2)
       .attr("height", d => height - y(d.crunchReps))
       .attr("fill", "orange");

    // 添加图例
    const legendData = [
        { name: "平板支撑时间（秒）", color: "steelblue" },
        { name: "卷腹次数", color: "orange" }
    ];

    const legend = svg.selectAll(".legend")
                      .data(legendData)
                      .enter()
                      .append("g")
                      .attr("class", "legend")
                      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
          .attr("x", width - 200)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", d => d.color);

    legend.append("text")
          .attr("x", width - 180)
          .attr("y", 9)
          .attr("dy", ".35em")
          .text(d => d.name)
          .style("font-size", "12px")
          .attr("alignment-baseline","middle");
}

// 初始绘图
updateChart();
