const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

//1
var theta1 = 0;
var angularVel1 = 0;
var angularAcc1 = 0;
var len1 = 150; // Length of first pendulum
var mass1 = 20; // Mass of first bob

//2
var theta2 = 0;
var angularVel2 = 0;
var angularAcc2 = 0;
var len2 = 150; // Length of second pendulum
var mass2 = 20; // Mass of second bob

var g = 9.8; // Gravity (m/s^2)
var origin = { x: 320, y: 50 }; // Pivot point
var isDragging = false; // Track if pendulum is being dragged
var dragBob = null; // Which bob is being dragged (1 or 2)

var lengthSlider, gravitySlider;
var lengthDisplay, gravityDisplay, periodDisplay;

function setup() {
    createControls();
    animate();
}

function createControls() {
    const controlsHTML = `
        <div id="controls" style="position: ; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px; font-family: Arial, sans-serif;">
            <h3 style="margin-top: 0;">Double Pendulum Simulation</h3>
            <div style="margin-bottom: 10px;">
                <label id="l1">Length 1: <span id="length1Display">${len1}</span>px</label><br>
                <input type="range" id="length1Slider" min="50" max="250" value="${len1}" style="width: 200px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label id="l2">Length 2: <span id="length2Display">${len2}</span>px</label><br>
                <input type="range" id="length2Slider" min="50" max="250" value="${len2}" style="width: 200px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label id="m1">Mass 1: <span id="mass1Display">${mass1}</span></label><br>
                <input type="range" id="mass1Slider" min="10" max="50" value="${mass1}" style="width: 200px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label id="m2">Mass 2: <span id="mass2Display">${mass2}</span></label><br>
                <input type="range" id="mass2Slider" min="10" max="50" value="${mass2}" style="width: 200px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label>Gravity: <span id="gravityDisplay">${g}</span> m/s²</label><br>
                <input type="range" id="gravitySlider" min="1" max="20" step="0.1" value="${g}" style="width: 200px;">
            </div>
            <button onclick="resetPendulum()" style="margin-top: 10px; padding: 5px 10px;">Reset</button>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', controlsHTML);

    document.getElementById('length1Slider').addEventListener('input', updateLength1);
    document.getElementById('length2Slider').addEventListener('input', updateLength2);
    document.getElementById('mass1Slider').addEventListener('input', updateMass1);
    document.getElementById('mass2Slider').addEventListener('input', updateMass2);
    document.getElementById('gravitySlider').addEventListener('input', updateGravity);
}

function updateLength1() {
    len1 = parseFloat(document.getElementById('length1Slider').value);
    document.getElementById('length1Display').textContent = len1;
}

function updateLength2() {
    len2 = parseFloat(document.getElementById('length2Slider').value);
    document.getElementById('length2Display').textContent = len2;
}

function updateMass1() {
    mass1 = parseFloat(document.getElementById('mass1Slider').value);
    document.getElementById('mass1Display').textContent = mass1;
}

function updateMass2() {
    mass2 = parseFloat(document.getElementById('mass2Slider').value);
    document.getElementById('mass2Display').textContent = mass2;
}

function updateGravity() {
    g = parseFloat(document.getElementById('gravitySlider').value);
    document.getElementById('gravityDisplay').textContent = g;
}

function resetPendulum() {
    theta1 = 0;
    angularVel1 = 0;
    angularAcc1 = 0;
    theta2 = 0;
    angularVel2 = 0;
    angularAcc2 = 0;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isDragging) {
        // Simplified double pendulum physics (more stable)
        const dt = 0.016;
        const damping = 0.999; // Add slight damping for stability

        // Convert lengths to meters for physics calculation
        const L1 = len1 / 100; // pixels to meters
        const L2 = len2 / 100;
        const M1 = mass1;
        const M2 = mass2;

        const delta = theta2 - theta1;
        const den1 = (M1 + M2) * L1 - M2 * L1 * Math.cos(delta) * Math.cos(delta);
        const den2 = (L2 / L1) * den1;

        // First pendulum acceleration
        const num1 = -M2 * L1 * angularVel1 * angularVel1 * Math.sin(delta) * Math.cos(delta);
        const num2 = M2 * g * Math.sin(theta2) * Math.cos(delta);
        const num3 = M2 * L2 * angularVel2 * angularVel2 * Math.sin(delta);
        const num4 = -(M1 + M2) * g * Math.sin(theta1);

        angularAcc1 = (num1 + num2 + num3 + num4) / den1;

        // Second pendulum acceleration
        const num5 = -M2 * L2 * angularVel2 * angularVel2 * Math.sin(delta) * Math.cos(delta);
        const num6 = (M1 + M2) * g * Math.sin(theta1) * Math.cos(delta);
        const num7 = (M1 + M2) * L1 * angularVel1 * angularVel1 * Math.sin(delta);
        const num8 = -(M1 + M2) * g * Math.sin(theta2);

        angularAcc2 = (num5 + num6 + num7 + num8) / den2;

        // Update velocities and angles with damping
        angularVel1 += angularAcc1 * dt;
        angularVel2 += angularAcc2 * dt;
        angularVel1 *= damping;
        angularVel2 *= damping;

        theta1 += angularVel1 * dt;
        theta2 += angularVel2 * dt;
    }

    // Calculate positions
    let bob1X = origin.x + len1 * Math.sin(theta1);
    let bob1Y = origin.y + len1 * Math.cos(theta1);
    let bob2X = bob1X + len2 * Math.sin(theta2);
    let bob2Y = bob1Y + len2 * Math.cos(theta2);

    // Draw first string
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(bob1X, bob1Y);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw second string
    ctx.beginPath();
    ctx.moveTo(bob1X, bob1Y);
    ctx.lineTo(bob2X, bob2Y);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pivot
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFD700";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    //draw bob1
    ctx.beginPath();
    ctx.arc(bob1X, bob1Y, mass1, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF4444";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    //draw bob2
    ctx.beginPath();
    ctx.arc(bob2X, bob2Y, mass2, 0, 2 * Math.PI);
    ctx.fillStyle = "#4444FF";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Continue animation
    requestAnimationFrame(animate);
}

// Add mouse interaction to drag the pendulums
canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

            let bob1X = origin.x + len1 * Math.sin(theta1);
        let bob1Y = origin.y + len1 * Math.cos(theta1);

    // Check which bob is clicked
    const dist1 = Math.sqrt((mouseX - bob1X) ** 2 + (mouseY - bob1Y) ** 2);
    const dist2 = Math.sqrt((mouseX - bob2X) ** 2 + (mouseY - bob2Y) ** 2);

    if (dist1 < 30) {
        isDragging = true;
        dragBob = 1;
        canvas.addEventListener('mousemove', dragPendulum);
        canvas.addEventListener('mouseup', releasePendulum);
    } else if (dist2 < 30) {
        isDragging = true;
        dragBob = 2;
        canvas.addEventListener('mousemove', dragPendulum);
        canvas.addEventListener('mouseup', releasePendulum);
    }
});

function dragPendulum(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (dragBob === 1) {
        const distX = mouseX - origin.x;
        const distY = mouseY - origin.y;
        theta1 = Math.atan2(distX, distY);
        angularVel1 = 0;
    } else if (dragBob === 2) {
        //drag second bob relative to first bob
        let bob1X = origin.x + len1 * Math.sin(theta1);
        let bob1Y = origin.y + len1 * Math.cos(theta1);
        const distX = mouseX - bob1X;
        const distY = mouseY - bob1Y;
        theta2 = Math.atan2(distX, distY);
        angularVel2 = 0;
    }
}

function releasePendulum() {
    isDragging = false;
    dragBob = null;
    canvas.removeEventListener('mousemove', dragPendulum);
    canvas.removeEventListener('mouseup', releasePendulum);
}

setup();
