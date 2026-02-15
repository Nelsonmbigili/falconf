const FutsalGame = (() => {
    const ASPECT_RATIO = 2 / 1.2; 
    const CANVAS_WIDTH = 1200;
    const FIELD_HEIGHT = 650;
    const INFO_PANEL_HEIGHT = 280;
    const CANVAS_HEIGHT = FIELD_HEIGHT + INFO_PANEL_HEIGHT;

    const COLORS = {
        pitch: '#2d5a27', 
        pitchLines: '#ffffff',
        woodFloor: '#d2a679', 
        coach: '#f1c40f', 
        coachStroke: '#964b00',
        blueTeam: '#1e3799',
        redTeam: '#b71540',
        ball: '#f5f6fa',
        hotspot: 'rgba(52, 152, 219, 0.4)',
        uiBg: '#0c2461',
        uiAccent: '#60a5fa',
        textMain: '#ffffff',
        textMuted: '#a5b1c2'
    };

    let canvas, ctx;
    let playerCoach = {
        x: CANVAS_WIDTH / 2,
        y: FIELD_HEIGHT / 2,
        radius: 18,
        angle: 0,
        targetX: CANVAS_WIDTH / 2,
        targetY: FIELD_HEIGHT / 2,
        speed: 6,
        isMoving: false
    };

    const team1 = [
        { x: 80, y: 325, role: 'Goalkeeper (GK)', desc: 'The "Fly-GK" potential. Modern keepers initiate the 5v4 power play.' },
        { x: 250, y: 325, role: 'Last Man (Anchor)', desc: 'The defensive heartbeat. Dictates build-up play and prevents counter-attacks.' },
        { x: 450, y: 150, role: 'Left Winger (Ala)', desc: 'Creative 1v1 specialist. Focuses on diagonal runs and high-press transitions.' },
        { x: 450, y: 500, role: 'Right Winger (Ala)', desc: 'Explosive pace on the flank. Provides width and services the target man.' },
        { x: 550, y: 325, role: 'Pivot (Striker)', desc: 'The focal point. Holds the ball under pressure to allow wingers to join the attack.' }
    ];

    const team2 = [
        { x: 1120, y: 325, role: 'Goalkeeper (GK)', desc: 'Primary shot-stopper. Responsible for rapid distribution and long-ball accuracy.' },
        { x: 950, y: 325, role: 'Last Man (Anchor)', desc: 'The organizational leader. Covers defensive gaps when wingers over-extend.' },
        { x: 750, y: 150, role: 'Left Winger (Ala)', desc: 'Inverse threat. Cuts inside to create shooting lanes or overload the center.' },
        { x: 750, y: 500, role: 'Right Winger (Ala)', desc: 'Touchline hugger. Stretches the defense to create gaps in the middle.' },
        { x: 650, y: 325, role: 'Pivot (Striker)', desc: 'Target specialist. Uses physical presence to turn defenders or lay off passes.' }
    ];

    const hotspots = [
        {
            id: 'sub-zone',
            x: CANVAS_WIDTH / 2,
            y: 35,
            radius: 50,
            title: 'Interchange Zone & Technical Area',
            data: [
                'Flying Substitutions: Unlimited rolling changes permitted.',
                'The 5-Meter Rule: Players must exit completely before subs enter.',
                'Equipment Check: Bibs must be worn by subs; improper entry is a Yellow Card.',
                'Coach Protocol: Must remain standing within the designated floor markings.'
            ]
        },
        {
            id: 'accumulation',
            x: 150,
            y: 150,
            radius: 60,
            title: 'Accumulated Foul Penalties',
            data: [
                'Foul Limit: Teams are penalized after 5 direct free-kick fouls per half.',
                'The 10m Mark: The 6th foul (and beyond) results in a "Second Penalty".',
                'No Wall: The defending team cannot form a wall for 10m spot kicks.',
                'Reset: All accumulated team fouls are cleared at the start of the second half.'
            ]
        }
    ];

    let activeHotspot = null;
    let activePlayer = null;

    function init(id) {
        canvas = document.getElementById(id);
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        canvas.addEventListener('mousedown', handleInput);
        requestAnimationFrame(gameLoop);
    }

    function handleInput(e) {
        const rect = canvas.getBoundingClientRect();
        
   
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height; 

        // Calculate exact internal coordinates
        playerCoach.targetX = (e.clientX - rect.left) * scaleX;
        playerCoach.targetY = (e.clientY - rect.top) * scaleY;
        
        playerCoach.isMoving = true;
    }

    function update() {
        if (playerCoach.isMoving) {
            const dx = playerCoach.targetX - playerCoach.x;
            const dy = playerCoach.targetY - playerCoach.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) { 
                playerCoach.angle = Math.atan2(dy, dx);

                if (dist < playerCoach.speed) {
                    playerCoach.x = playerCoach.targetX;
                    playerCoach.y = playerCoach.targetY;
                    playerCoach.isMoving = false;
                } else {
                    playerCoach.x += Math.cos(playerCoach.angle) * playerCoach.speed;
                    playerCoach.y += Math.sin(playerCoach.angle) * playerCoach.speed;
                }
            } else {
                playerCoach.isMoving = false;
            }
        }

        activeHotspot = hotspots.find(h => Math.hypot(playerCoach.x - h.x, playerCoach.y - h.y) < h.radius + 15);
        activePlayer = [...team1, ...team2].find(p => Math.hypot(playerCoach.x - p.x, playerCoach.y - p.y) < 40);
    }

    function draw() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // 1. Draw Pitch
        ctx.fillStyle = COLORS.pitch;
        ctx.fillRect(0, 0, CANVAS_WIDTH, FIELD_HEIGHT);
        
        // Pitch Markings
        ctx.strokeStyle = COLORS.pitchLines;
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 50, CANVAS_WIDTH - 100, FIELD_HEIGHT - 100);
        
        // Center Line & Circle
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 50);
        ctx.lineTo(CANVAS_WIDTH / 2, FIELD_HEIGHT - 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, FIELD_HEIGHT / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        // Penalty D (6m)
        drawGoalArea(50, FIELD_HEIGHT / 2, 0);
        drawGoalArea(CANVAS_WIDTH - 50, FIELD_HEIGHT / 2, Math.PI);

        // 2. Draw Hotspots
        hotspots.forEach(h => {
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fillStyle = COLORS.hotspot;
            ctx.fill();
            // Pulse Icon
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('?', h.x - 5, h.y + 7);
        });

        // 3. Draw Players
        drawTeam(team1, COLORS.blueTeam);
        drawTeam(team2, COLORS.redTeam);

        // 4. Draw Coach
        drawCoachEntity();

        // 5. Info Panel
        drawUI();
    }

    function drawGoalArea(x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.arc(0, 0, 100, -Math.PI/2, Math.PI/2);
        ctx.stroke();
        // 10m Mark
        ctx.fillRect(160, -2, 10, 4);
        ctx.restore();
    }

    function drawTeam(players, color) {
        players.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    function drawCoachEntity() {
        ctx.save();
        ctx.translate(playerCoach.x, playerCoach.y);
        ctx.rotate(playerCoach.angle);
        
        // Body
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';
        ctx.fillStyle = COLORS.coach;
        ctx.beginPath();
        ctx.arc(0, 0, playerCoach.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Whistle Symbol
        ctx.shadowBlur = 0;
        ctx.strokeStyle = COLORS.coachStroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(-6, -2, 12, 4);
        
        ctx.restore();
    }

    function drawUI() {
        ctx.fillStyle = COLORS.uiBg;
        ctx.fillRect(0, FIELD_HEIGHT, CANVAS_WIDTH, INFO_PANEL_HEIGHT);
        ctx.strokeStyle = COLORS.uiAccent;
        ctx.strokeRect(10, FIELD_HEIGHT + 10, CANVAS_WIDTH - 20, INFO_PANEL_HEIGHT - 20);

        ctx.fillStyle = COLORS.textMain;
        ctx.textAlign = 'left';

        if (activePlayer) {
            ctx.font = 'bold 30px Arial';
            ctx.fillText(activePlayer.role, 50, FIELD_HEIGHT + 60);
            ctx.font = '20px Arial';
            ctx.fillStyle = COLORS.textMuted;
            ctx.fillText(activePlayer.desc, 50, FIELD_HEIGHT + 100);
            ctx.fillText("• Primary Task: Transitioning play and maintaining team shape.", 50, FIELD_HEIGHT + 140);
        } else if (activeHotspot) {
            ctx.font = 'bold 30px Arial';
            ctx.fillText(activeHotspot.title, 50, FIELD_HEIGHT + 60);
            activeHotspot.data.forEach((line, i) => {
                ctx.font = '18px Arial';
                ctx.fillStyle = COLORS.textMain;
                ctx.fillText(`› ${line}`, 50, FIELD_HEIGHT + 105 + (i * 35));
            });
        } else {
            ctx.font = '24px Arial';
            ctx.fillText("TACTICAL ANALYZER", 50, FIELD_HEIGHT + 70);
            ctx.font = '18px Arial';
            ctx.fillStyle = COLORS.textMuted;
            ctx.fillText("Click on the pitch to move the Coach. Approach players or zones to reveal FIFA rules.", 50, FIELD_HEIGHT + 110);
        }
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    return { init };
})();

window.onload = () => FutsalGame.init('gameCanvas');