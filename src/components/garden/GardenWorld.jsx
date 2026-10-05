import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { PlantSprite, PlayerSprite, TreeSprite, getPlantVisualStage } from './sprites';
import { COLS, ROWS, SPOTS, EMPTY_POT, DIRECTIONS, keyFor, distance, getGardenPageCount, getGardenPageForPlant, getGardenPlantRange, getGardenObjects, makeObstacles, pathToObject } from './worldModel.mjs';
import { createHeldMovement, HELD_MOVE_INTERVAL } from './movement.mjs';
import './world.css';

const TREES = [{ x: 8, y: 5 }, { x: 150, y: 2 }, { x: 264, y: 3 }, { x: 292, y: 25 }, { x: 286, y: 119 }, { x: 4, y: 104 }];

function Flowers({ x, y, pink = false }) {
    return <g transform={`translate(${x} ${y})`}><path fill="#507d4c" d="M3 3h1v4H3zM8 7h1v3H8zM12 2h1v5h-1z" /><path fill={pink ? '#d69b86' : '#ead190'} d="M2 2h3v3H2zM7 6h3v3H7zM11 1h3v3h-3z" /><path fill="#f6e9b8" d="M3 3h1v1H3zM8 7h1v1H8zM12 2h1v1h-1z" /></g>;
}

function Environment({ palette, page }) {
    const grass = palette === 'sunset' ? '#a3af71' : palette === 'moon' ? '#728f83' : '#a6bd7f';
    const darkGrass = palette === 'sunset' ? '#839862' : palette === 'moon' ? '#58766b' : '#86a76b';
    return <svg className="cg-world-map" viewBox="0 0 320 208" shapeRendering="crispEdges" aria-hidden="true">
        <defs>
            <pattern id="cg-grass" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill={grass} /><path fill={darkGrass} opacity=".55" d="M3 11h2v1H3zM4 9h1v3H4zM21 25h2v1h-2zM22 23h1v3h-1zM14 4h1v1h-1z" /><path fill="#c7d69b" opacity=".65" d="M15 17h2v1h-2zM26 7h1v1h-1z" /></pattern>
            <pattern id="cg-path" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#d6c59b" /><path fill="#c4b489" d="M2 4h3v1H2zM10 12h2v1h-2zM14 2h1v2h-1z" /><path fill="#ecdcac" d="M6 10h2v1H6z" /></pattern>
            <pattern id="cg-roof" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#e2c792" /><path fill="#c0a37a" d="M0 7h12v1H0zM0 3h12v1H0zM5 0h1v3H5zM10 4h1v3h-1z" /></pattern>
        </defs>
        <rect width="320" height="208" fill="url(#cg-grass)" />
        <path fill={darkGrass} opacity=".6" d="M0 0h320v9H0zM0 9h8v190H0zM312 9h8v190h-8zM0 199h140v9H0zM180 199h140v9H180z" />
        <path fill="#a79370" d="M83 64h26v63h163v27H180v54h-32v-54H30v-27h53z" />
        <path fill="url(#cg-path)" d="M86 64h20v66h163v21h-92v57h-26v-57H33v-21h53z" />
        {/* The greenhouse: handmade tile roof, glass panes, timber and a little sign. */}
        <path fill="#456347" opacity=".35" d="M44 62h97v10H44z" />
        <path fill="#496756" d="M44 30h92v36H44z" /><rect x="48" y="33" width="84" height="29" fill="#d3d8ad" />
        <path fill="#8baaa0" d="M51 36h17v20H51zM72 36h14v20H72zM107 36h21v20h-21z" /><path fill="#c0d9bf" d="M52 36h4v13h-4zM73 36h3v13h-3zM108 36h4v13h-4zM58 36h2v6h-2zM115 36h2v6h-2z" />
        <path fill="#617964" d="M59 51h2v5h-2zM55 48h4v4h-4zM61 46h4v6h-4zM76 48h2v8h-2zM74 47h5v3h-5zM118 46h2v10h-2zM114 47h8v4h-8z" />
        <path fill="#6d8062" d="M49 45h80v2H49zM68 34h3v25h-3zM86 33h3v29h-3zM104 33h3v29h-3z" />
        <path fill="#596852" d="M89 36h14v29H89z" /><path fill="#8b9d74" d="M91 38h10v25H91z" /><path fill="#c2d6b4" d="M92 40h8v11h-8z" /><rect x="99" y="54" width="1" height="2" fill="#e8d293" />
        <path fill="#385a48" d="M42 28h96v6H42zM47 17h86v11H47zM54 12h73v5H54z" /><path fill="url(#cg-roof)" d="M44 29v-3h5v-9h6v-4h70v4h7v9h4v3z" />
        <path fill="#ecdcad" d="M57 14h64v2H57zM50 20h80v1H50zM45 28h90v2H45z" />
        <path fill="#857255" d="M88 18h17v7H88z" /><path fill="#f4e6b8" d="M89 19h15v5H89z" /><path fill="#65835a" d="M95 20h3v1h2v1h-2v1h-3v-1h-2v-1h2z" />
        <path fill="#8c9b75" d="M86 65h21v3H86z" /><path fill="#bec4a0" d="M88 65h17v2H88z" />
        {/* Small workbench and neatly stacked supplies. */}
        <path fill="#6a6047" d="M205 44h3v20h-3zM239 44h3v20h-3z" /><path fill="#876c48" d="M202 44h43v6h-43z" /><path fill="#c4a478" d="M201 43h44v3h-44z" /><path fill="#756248" d="M207 52h34v2h-34z" />
        <path fill="#557b70" d="M213 36h9v7h-9zM209 37h4v2h-4zM209 39h2v3h-2zM220 32h2v4h-2z" /><path fill="#8db4a3" d="M214 35h7v2h-7zM218 31h5v2h-5z" />
        <path fill="#b99667" d="M228 36h10v7h-10z" /><path fill="#e1cf8e" d="M228 36h10v2h-10z" /><path fill="#476c4a" d="M232 31h2v5h-2zM229 29h3v3h-3zM234 27h3v5h-3z" />
        <path fill="#686043" d="M253 45h8v15h-8z" /><path fill="#aaa177" d="M254 43h6v3h-6z" /><path fill="#e1d2a0" d="M255 47h4v1h-4z" />
        {/* Pond, lilies and animated little ripples. */}
        <path fill="#80945d" d="M18 165h11v-7h31v4h11v12h7v14h-7v7H28v-5H17z" /><path fill="#567d74" d="M21 166h11v-5h25v4h12v12h6v8h-7v7H29v-5H21z" /><path fill="#79aba2" d="M23 168h12v-5h21v5h11v11h6v5h-8v6H31v-5H23z" /><path fill="#9dc5b2" d="M35 164h18v2H35zM24 170h2v11h-2zM34 187h19v2H34z" />
        <g className="cg-pond-ripples" fill="#b0d3bf"><path d="M36 174h12v1H36zM51 182h12v1H51zM28 179h5v1h-5z" /></g>
        <path fill="#426e48" d="M52 168h9v2h2v3h-4v2h-7zM31 181h7v2h-3v3h-6v-3h2z" /><path fill="#8ca669" d="M53 169h7v2h-7zM31 182h3v2h-3z" /><path fill="#dfb5a1" d="M56 166h3v3h-3z" />
        <path fill="#577a51" d="M18 185h2v7h-2zM15 182h2v7h-2zM73 164h2v8h-2z" /><path fill="#b39e62" d="M15 179h2v5h-2zM73 161h2v5h-2z" />
        {/* Plant beds and their warm timber edging. */}
        {[...SPOTS, EMPTY_POT].map((spot, index) => <g key={index} transform={`translate(${spot.x * 16 - 11} ${spot.y * 16 - 2})`}><path fill="#827052" d="M0 0h38v17H0z" /><path fill="#9c8060" d="M2 2h34v12H2z" /><path fill="#c6a377" d="M0 0h38v2H0zM0 2h2v13H0z" /><path fill="#745f48" d="M4 4h30v9H4z" /><path fill="#ad9160" d="M5 6h3v1H5zM29 10h2v1h-2zM25 4h2v1h-2z" /><rect x="1" y="16" width="36" height="1" fill="#5f6249" /></g>)}
        {/* Fence has a real opening at the entrance. */}
        {[...Array(20)].map((_, i) => <g key={`top-${i}`} transform={`translate(${i * 16} 0)`}><path fill="#796e50" d="M0 6h16v2H0zM0 12h16v2H0zM3 2h3v15H3z" /><path fill="#c1b489" d="M3 1h3v13H3zM0 5h16v2H0zM0 11h16v2H0z" /><rect x="4" y="1" width="1" height="2" fill="#e4d5a7" /></g>)}
        {[...Array(20)].map((_, i) => i !== 9 && i !== 10 ? <g key={`bottom-${i}`} transform={`translate(${i * 16} 190)`}><path fill="#796e50" d="M0 6h16v2H0zM0 12h16v2H0zM3 2h3v15H3z" /><path fill="#c1b489" d="M3 1h3v13H3zM0 5h16v2H0zM0 11h16v2H0z" /></g> : null)}
        {[...Array(10)].map((_, i) => <g key={`side-${i}`}><path fill="#9e9270" d={`M3 ${20 + i * 16}h3v16H3zM314 ${20 + i * 16}h3v16h-3z`} /><path fill="#c1b489" d={`M1 ${23 + i * 16}h7v3H1zM312 ${23 + i * 16}h7v3h-7z`} /></g>)}
        <Flowers x={24} y={71} /><Flowers x={132} y={67} pink /><Flowers x={181} y={170} /><Flowers x={246} y={170} pink /><Flowers x={78} y={184} /><Flowers x={268} y={82} />
        <path fill="#becba0" d="M139 95h4v2h-4zM143 97h3v2h-3zM182 115h5v3h-5zM190 112h3v2h-3zM116 177h4v2h-4zM270 156h4v2h-4z" />
        <path fill="#6c7454" d="M185 87h3v6h-3zM183 86h7v5h-7z" /><path fill="#dcc38a" d="M182 84h9v5h-9z" /><path fill="#7b835b" d="M184 85h5v1h-5z" />
        {TREES.map((tree, index) => <TreeSprite key={index} {...tree} variant={index % 3} />)}
        <g className="cg-butterfly" transform="translate(185 55)"><path fill="#eac88b" d="M0 0h3v4H0zM5 0h3v4H5z" /><path fill="#665943" d="M3 1h2v5H3z" /></g>
        {page > 0 && <path fill="#d4dfb1" d="M191 180h11v2h-11zM192 182h9v2h-9z" />}
    </svg>;
}

export function GardenWorld({ plants = [], onVisitPlant, onPlantNew, paused = false, selectedPlantId, wateredPlantId, palette = 'sage' }) {
    const [page, setPage] = useState(0);
    const [player, setPlayer] = useState({ x: 10, y: 9, facing: 'down', walking: false });
    const [walkingTo, setWalkingTo] = useState(null);
    const [focused, setFocused] = useState(false);
    const [notice, setNotice] = useState('A little garden, a little moment of calm.');
    const worldRef = useRef(null);
    const wasPausedRef = useRef(paused);
    const playerRef = useRef(player);
    const movementRef = useRef(null);
    if (!movementRef.current) movementRef.current = createHeldMovement();
    const routeRef = useRef([]);
    const destinationRef = useRef(null);
    const nextRouteStepRef = useRef(0);
    const lastMovementRef = useRef(0);
    const gardenSelectId = useId();
    const callbacksRef = useRef({ onVisitPlant, onPlantNew });
    callbacksRef.current = { onVisitPlant, onPlantNew };
    const pages = getGardenPageCount(plants.length);
    const safePage = Math.min(page, pages - 1);
    const selectedPage = getGardenPageForPlant(plants, selectedPlantId);
    const range = getGardenPlantRange(plants.length, safePage);
    const objects = useMemo(() => getGardenObjects(plants, safePage), [plants, safePage]);
    const obstacles = useMemo(() => makeObstacles(), []);
    const nearest = objects.filter((object) => distance(player, object) === 1).sort((a, b) => Number(b.x === player.x || b.y === player.y) - Number(a.x === player.x || a.y === player.y))[0];

    const updatePlayer = useCallback((next) => {
        playerRef.current = next;
        setPlayer(next);
    }, []);
    const stopRoute = useCallback(() => {
        routeRef.current = [];
        destinationRef.current = null;
        setWalkingTo(null);
    }, []);
    const stopMovement = useCallback(() => {
        movementRef.current.reset();
        stopRoute();
        updatePlayer({ ...playerRef.current, walking: false });
    }, [stopRoute, updatePlayer]);
    const visit = useCallback((object) => {
        stopMovement();
        if (object.empty) callbacksRef.current.onPlantNew?.();
        else callbacksRef.current.onVisitPlant?.(object.plant);
    }, [stopMovement]);
    const step = useCallback((direction) => {
        if (paused || !direction) return;
        const [dx, dy, facing] = direction;
        const current = playerRef.current;
        const x = current.x + dx;
        const y = current.y + dy;
        if (obstacles.has(keyFor(x, y)) || x < 0 || y < 0 || x >= COLS || y >= ROWS) {
            updatePlayer({ ...current, facing, walking: false });
            return;
        }
        lastMovementRef.current = performance.now();
        updatePlayer({ x, y, facing, walking: true });
    }, [obstacles, paused, updatePlayer]);
    const walkTo = useCallback((object) => {
        if (paused) return;
        worldRef.current?.focus({ preventScroll: true });
        movementRef.current.reset();
        const route = pathToObject(playerRef.current, object, obstacles);
        if (route === null) { setNotice('That path is blocked. Try the main garden path.'); return; }
        if (!route.length) { visit(object); return; }
        routeRef.current = route;
        nextRouteStepRef.current = performance.now();
        destinationRef.current = object;
        setWalkingTo(object.id);
        setNotice(`Walking over to ${object.empty ? 'the empty pot' : object.name}…`);
    }, [obstacles, paused, visit]);

    useEffect(() => {
        if (paused) {
            stopMovement();
            return undefined;
        }
        const timer = window.setInterval(() => {
            const now = performance.now();
            const direction = movementRef.current.tick(now);
            if (direction) { step(direction); return; }
            if (routeRef.current.length && now >= nextRouteStepRef.current) {
                const next = routeRef.current.shift();
                lastMovementRef.current = now;
                nextRouteStepRef.current = now + HELD_MOVE_INTERVAL;
                updatePlayer({ ...next, walking: true });
                return;
            }
            if (!routeRef.current.length && destinationRef.current && now >= nextRouteStepRef.current) {
                const destination = destinationRef.current;
                setNotice(`You visited ${destination.empty ? 'the empty pot' : destination.name}.`);
                visit(destination);
                return;
            }
            if (playerRef.current.walking && now - lastMovementRef.current > HELD_MOVE_INTERVAL) updatePlayer({ ...playerRef.current, walking: false });
        }, 25);
        return () => window.clearInterval(timer);
    }, [paused, step, stopMovement, updatePlayer, visit]);

    useEffect(() => {
        const releasePointer = (event) => movementRef.current.release(`pointer:${event.pointerId}`, performance.now());
        const releaseKey = (event) => movementRef.current.release(`key:${event.key.length === 1 ? event.key.toLowerCase() : event.key}`, performance.now());
        const hide = () => { if (document.hidden) stopMovement(); };
        window.addEventListener('blur', stopMovement);
        window.addEventListener('pointerup', releasePointer);
        window.addEventListener('pointercancel', releasePointer);
        window.addEventListener('keyup', releaseKey);
        document.addEventListener('visibilitychange', hide);
        return () => {
            window.removeEventListener('blur', stopMovement);
            window.removeEventListener('pointerup', releasePointer);
            window.removeEventListener('pointercancel', releasePointer);
            window.removeEventListener('keyup', releaseKey);
            document.removeEventListener('visibilitychange', hide);
        };
    }, [stopMovement]);

    useEffect(() => {
        if (selectedPage >= 0) setPage(selectedPage);
    }, [selectedPlantId, selectedPage]);

    useEffect(() => {
        stopMovement();
        updatePlayer({ x: 10, y: 9, facing: 'down', walking: false });
        // Collection changes can remove the last garden after a harvest.
        setPage(safePage);
    }, [safePage, stopMovement, updatePlayer]);

    useEffect(() => {
        const destination = destinationRef.current;
        if (destination && !objects.some((object) => object.id === destination.id)) stopMovement();
    }, [objects, stopMovement]);

    useEffect(() => {
        const resume = wasPausedRef.current && !paused;
        wasPausedRef.current = paused;
        if (!resume) return undefined;
        // Wait until the dialog has closed before returning keyboard controls.
        const frame = window.requestAnimationFrame(() => worldRef.current?.focus({ preventScroll: true }));
        return () => window.cancelAnimationFrame(frame);
    }, [paused]);

    const onKeyDown = (event) => {
        if (paused || event.target !== event.currentTarget || event.altKey || event.metaKey || event.ctrlKey) return;
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        if (DIRECTIONS[key]) {
            event.preventDefault();
            if (!event.repeat) {
                stopRoute();
                const direction = movementRef.current.press(`key:${key}`, DIRECTIONS[key], performance.now());
                if (direction) step(direction);
            }
        } else if (key === 'e' || key === ' ' || key === 'Enter') {
            event.preventDefault();
            if (event.repeat) return;
            if (nearest) visit(nearest);
            else setNotice('Walk next to a plant or the empty pot, then press E.');
        }
    };
    const onKeyUp = (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        if (DIRECTIONS[key]) { event.preventDefault(); movementRef.current.release(`key:${key}`, performance.now()); }
    };
    const changePage = (next) => {
        stopMovement();
        const target = Math.max(0, Math.min(next, pages - 1));
        setPage(target);
        setNotice(`Visiting garden ${target + 1} of ${pages}.`);
        worldRef.current?.focus({ preventScroll: true });
    };
    const dpadDown = (event, key) => {
        event.preventDefault();
        if (paused) return;
        stopRoute();
        const direction = movementRef.current.press(`pointer:${event.pointerId}`, DIRECTIONS[key], performance.now());
        if (direction) step(direction);
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    return <section className={`cg-world ${focused ? 'is-focused' : ''} ${paused ? 'is-paused' : ''}`} aria-label="Interactive Cannagotchi garden">
        <div className="cg-world-toolbar">
            <span className="cg-world-location"><span className="cg-world-location__dot" /> {pages > 1 ? `Garden ${safePage + 1} of ${pages}` : 'Home garden'} <span className="cg-world-location__sub">{palette === 'moon' ? 'Evening light' : palette === 'sunset' ? 'Golden hour' : 'A quiet afternoon'}</span></span>
            <span className="cg-world-toolbar__plants">{plants.length} {plants.length === 1 ? 'plant' : 'plants'} growing</span>
        </div>
        <nav className="cg-world-gardens" aria-label="Your gardens">
            <div className="cg-world-gardens__summary" aria-live="polite"><strong>{plants.length ? `Plants ${range.first}–${range.last} of ${range.total}` : 'Your first garden'}</strong><span>{pages > 1 ? `Your ${range.total} plants are shared across ${pages} gardens.` : plants.length ? 'Every plant has a place here.' : 'An empty pot is waiting for you.'}</span></div>
            {pages > 1 && <div className="cg-world-gardens__controls"><button type="button" aria-label="Previous garden" title="Previous garden" disabled={safePage === 0 || paused} onClick={() => changePage(safePage - 1)}>←</button><label className="cg-world-gardens__label" htmlFor={gardenSelectId}>Choose garden</label><select id={gardenSelectId} value={safePage} disabled={paused} onChange={(event) => changePage(Number(event.target.value))} aria-label="Choose garden">{Array.from({ length: pages }, (_, index) => {
                const count = Math.min(SPOTS.length, plants.length - index * SPOTS.length);
                return <option key={index} value={index}>Garden {index + 1} · {count} {count === 1 ? 'plant' : 'plants'}</option>;
            })}</select><button type="button" aria-label="Next garden" title="Next garden" disabled={safePage === pages - 1 || paused} onClick={() => changePage(safePage + 1)}>→</button></div>}
        </nav>
        <div ref={worldRef} className="cg-world-viewport" role="group" aria-label="Garden map. Use arrow keys or WASD to walk. Press E or Space next to a plant to visit. You can also click a plant." tabIndex={paused ? -1 : 0} data-testid="garden-world" data-garden-page={safePage + 1} data-player-x={player.x} data-player-y={player.y} data-player-facing={player.facing} onKeyDown={onKeyDown} onKeyUp={onKeyUp} onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); stopMovement(); } }} onPointerDown={(event) => { if (event.target.closest('button')) return; worldRef.current?.focus({ preventScroll: true }); }}>
            <Environment palette={palette} page={safePage} />
            <div className="cg-world-sign" aria-hidden="true">GROW AT YOUR OWN PACE</div>
            {objects.map((object) => <button key={object.id} type="button" className={`cg-world-object ${object.empty ? 'is-empty' : ''} ${nearest?.id === object.id || selectedPlantId === object.id ? 'is-near' : ''} ${walkingTo === object.id ? 'is-destination' : ''}`} style={{ left: `${(object.x - .5) * 5}%`, top: `${(object.y - 1.5) / ROWS * 100}%`, zIndex: object.y * 10 + 4 }} disabled={paused} onClick={() => walkTo(object)} aria-label={object.empty ? 'Walk to empty pot and plant something' : `Visit ${object.name}`} data-plant-id={object.empty ? undefined : object.id}>
                <span className="cg-world-object__marker" aria-hidden="true">{walkingTo === object.id ? '…' : '!'}</span>
                <PlantSprite plant={object.plant} stage={object.empty ? 'seed' : getPlantVisualStage(object.plant)} empty={object.empty} watered={!object.empty && wateredPlantId === object.id} size={80} />
                <span className="cg-world-object__name">{object.empty ? '+ Plant something' : object.name}</span>
            </button>)}
            <div className="cg-world-player" data-testid="garden-player" style={{ left: `${player.x * 5}%`, top: `${(player.y - .5) / ROWS * 100}%`, zIndex: player.y * 10 + 5 }}>
                <PlayerSprite facing={player.facing} walking={player.walking} />
                <span className="cg-world-player__name">YOU</span>
            </div>
            {!focused && !paused && <div className="cg-world-focus-hint">Click the garden to walk · or tap a plant</div>}
            {paused && <div className="cg-world-paused" aria-hidden="true">Taking a closer look</div>}
        </div>
        <div className="cg-world-bottom">
            <div className="cg-world-message">
                <span className="cg-world-message__icon" aria-hidden="true">✦</span>
                <div><p aria-live="polite" role="status">{walkingTo ? notice : nearest ? `${nearest.empty ? 'An empty pot. A fresh beginning.' : `${nearest.name} is right here.`}` : notice}</p><span className="cg-world-keyboard-hint"><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> or WASD to walk <span>·</span> <kbd>E</kbd> to visit</span><span className="cg-world-touch-hint">Hold the arrows to walk, or tap any plant to visit.</span></div>
            </div>
            <button type="button" className="cg-world-interact" disabled={paused || !nearest || !!walkingTo} onClick={() => nearest && visit(nearest)}><span aria-hidden="true">{nearest?.empty ? '+' : '↗'}</span> {nearest?.empty ? 'Plant something' : nearest ? 'Visit plant' : 'Walk to a plant'} <kbd>E</kbd></button>
        </div>
        <div className="cg-world-touch-controls" aria-label="Garden movement controls">
            <div className="cg-world-dpad">
                {[['ArrowUp', '↑', 'up'], ['ArrowLeft', '←', 'left'], ['ArrowDown', '↓', 'down'], ['ArrowRight', '→', 'right']].map(([key, arrow, name]) => <button key={key} type="button" className={`cg-world-dpad__${name}`} aria-label={`Walk ${name}`} disabled={paused} onPointerDown={(event) => dpadDown(event, key)} onPointerUp={(event) => movementRef.current.release(`pointer:${event.pointerId}`, performance.now())} onPointerCancel={(event) => movementRef.current.release(`pointer:${event.pointerId}`, performance.now())} onLostPointerCapture={(event) => movementRef.current.release(`pointer:${event.pointerId}`, performance.now())} onClick={(event) => { if (event.detail === 0) { stopRoute(); step(DIRECTIONS[key]); } }}>{arrow}</button>)}
                <span className="cg-world-dpad__center" aria-hidden="true">✦</span>
            </div>
            <p>Little steps.<br />Good things grow.</p>
        </div>
    </section>;
}

export default GardenWorld;
