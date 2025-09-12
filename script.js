let target = {
    cal: 2700,
    protein: 150,
    carb: 350,
    fat: 70,
    water: 4
};

let allData = JSON.parse(localStorage.getItem('dailyData')) || {};
let today = new Date().toISOString().split('T')[0];
let currentDate = today;

if (!allData[today]) allData[today] = { foodData: [], water: 0 };

const presetFoods = {
    'Pankek': {cal: 1010, protein: 29.8, carb: 39.5, fat: 18},
    'Protein Tozu(25g)': {cal: 85, protein: 18.3, carb: 1.9, fat: 0.3},
    'Tost': {cal: 920, protein: 44.5, carb: 99, fat: 39},
    'Tam Döner': {cal: 680, protein: 32, carb: 203, fat: 13},
    'Nescafe 3’ü 1 Arada': {cal: 81, protein: 0.51, carb: 15.6, fat: 1.94},
    'Creatin(4g)': {cal: 0, protein: 0, carb: 0, fat: 0},
    'Makarna(100g)': {cal: 158, protein: 5.8, carb: 30.8, fat: 0.9},
    'Yoğurt(100g)': {cal: 46, protein: 3.4, carb: 4.1, fat: 1.5},
    'Pilav(100g)': {cal: 132, protein: 2.9, carb: 30.9, fat: 0},
    'Tavuk(100g)': {cal: 163, protein: 28, carb: 1, fat: 5.3},
    'Shake': {cal: 610, protein: 38, carb: 72, fat: 14},
};

document.getElementById('date-picker').value = today;

function changeDate() {
    currentDate = document.getElementById('date-picker').value;
    if (!allData[currentDate]) allData[currentDate] = { foodData: [], water: 0 };
    updateTable(currentDate);
}

function addFood() {
    const name = document.getElementById('food-name').value.trim();
    const cal = parseFloat(document.getElementById('food-cal').value);
    const protein = parseFloat(document.getElementById('food-protein').value);
    const carb = parseFloat(document.getElementById('food-carb').value);
    const fat = parseFloat(document.getElementById('food-fat').value);
    const multiplier = parseFloat(document.getElementById('food-multiplier').value) || 1;

    if (!name || isNaN(cal) || isNaN(protein) || isNaN(carb) || isNaN(fat)) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    allData[currentDate].foodData.push({name, cal, protein, carb, fat, multiplier});
    saveData();
    updateTable(currentDate);
    clearFoodInputs();
}

function addPresetFood(name) {
    if (!presetFoods[name]) return;
    const food = presetFoods[name];

    allData[currentDate].foodData.push({
        name,
        cal: food.cal,
        protein: food.protein,
        carb: food.carb,
        fat: food.fat,
        multiplier: 1
    });
    saveData();
    updateTable(currentDate);
}

function updateTable(selectedDate) {
    const tbody = document.getElementById('food-table-body');
    tbody.innerHTML = '';

    let totalCal = 0, totalProtein = 0, totalCarb = 0, totalFat = 0;

    allData[selectedDate].foodData.forEach((food, index) => {
        const cal = food.cal * food.multiplier;
        const protein = food.protein * food.multiplier;
        const carb = food.carb * food.multiplier;
        const fat = food.fat * food.multiplier;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Besin">${food.name}</td>
            <td data-label="Kalori">${cal}</td>
            <td data-label="Protein">${protein.toFixed(1)}</td>
            <td data-label="Karbonhidrat">${carb.toFixed(1)}</td>
            <td data-label="Yağ">${fat.toFixed(1)}</td>
            <td data-label="Porsiyon">
                <input type="number" min="1" value="${food.multiplier}" 
                    onchange="updateMultiplier(${index}, this.value)">
            </td>
            <td data-label="İşlem"><button onclick="removeFood(${index})">Sil</button></td>
        `;
        tbody.appendChild(row);

        totalCal += cal;
        totalProtein += protein;
        totalCarb += carb;
        totalFat += fat;
    });

    const water = allData[selectedDate].water || 0;

animateProgressBar();


    document.getElementById('totals').innerHTML = `Toplam: Kalori ${Math.round(totalCal)} kcal | Protein ${totalProtein.toFixed(1)} g | Karbonhidrat ${totalCarb.toFixed(1)} g | Yağ ${totalFat.toFixed(1)} g`;
    document.getElementById('water-total').innerHTML = `Su: ${water.toFixed(1)} L / ${target.water} L`;
    document.getElementById('remaining').innerHTML = `Kalan: Kalori ${Math.round(target.cal - totalCal)} kcal | Protein ${(target.protein - totalProtein).toFixed(1)} g | Karbonhidrat ${(target.carb - totalCarb).toFixed(1)} g | Yağ ${(target.fat - totalFat).toFixed(1)} g`;
}

function updateMultiplier(index, value) {
    const multiplier = parseFloat(value);
    if (multiplier < 1 || isNaN(multiplier)) return;
    allData[currentDate].foodData[index].multiplier = multiplier;
    saveData();
    updateTable(currentDate);
}

function removeFood(index) {
    allData[currentDate].foodData.splice(index, 1);
    saveData();
    updateTable(currentDate);
}

function updateWater() {
    allData[currentDate].water = (allData[currentDate].water || 0) + 0.5;
    saveData();
    updateTable(currentDate);
}

function removeWater() {
    allData[currentDate].water = Math.max(0, (allData[currentDate].water || 0) - 0.5);
    saveData();
    updateTable(currentDate);
}
function animateProgressBar() {
    const water = allData[currentDate].water || 0;
    const percent = Math.min((water / target.water) * 100, 100);
    const bar = document.getElementById('water-progress');
    if (bar) {
        bar.style.width = percent + '%';
    }
}


function saveData() {
    localStorage.setItem('dailyData', JSON.stringify(allData));
}

window.onload = () => updateTable(currentDate);

