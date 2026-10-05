import { getPlantAgeInDays } from '../../utils/plants';

// Original pixel drawings. Every shape lives on the same small integer grid.
export const getPlantVisualStage = (plant) => {
    if (plant?.visualStage && plant.visualStage !== 'auto') return plant.visualStage;
    const age = getPlantAgeInDays(plant?.germination_date);
    if (age < 3) return 'seed';
    if (age < 10) return 'sprout';
    if (age <= 30) return 'seedling';
    if (age <= 60) return 'vegetative';
    if (age <= 120) return 'flowering';
    return 'mature';
};

function Leaf({ x, y, flip = false, light = false }) {
    return (
        <g transform={`translate(${x} ${y}) ${flip ? 'scale(-1 1)' : ''}`}>
            <path fill={light ? '#98be58' : '#3f7850'} d="M0 0h-2v-2h-3v-2h-3v-2h-2v-4h2v2h3v2h3v2h2z" />
            <path fill={light ? '#547d3f' : '#2e5b40'} d="M-1 0h-2v-2h-3v-2h-3v-2h2v1h3v2h3z" />
            <path fill={light ? '#bbd778' : '#74a753'} d="M-8-8h3v2h3v2h-3v-1h-3z" />
        </g>
    );
}

export function PlantSprite({ plant, stage, size = 64, className = '', title, empty = false, watered = false }) {
    const value = stage && stage !== 'auto' ? stage : getPlantVisualStage(plant);
    const stages = ['seed', 'sprout', 'seedling', 'vegetative', 'flowering', 'mature'];
    const names = { Seedling: 'seedling', Vegetative: 'vegetative', 'Early flower': 'flowering', Flowering: 'flowering', 'Late flower': 'mature', 'Harvest window': 'mature' };
    const resolved = typeof value === 'number' ? stages[Math.min(5, Math.max(0, value))] : (names[value] || value);
    const level = Math.max(0, stages.indexOf(resolved));
    return (
        <svg className={`cg-plant-sprite ${className}`} width={size} height={size * 1.25} viewBox="0 0 32 40" shapeRendering="crispEdges" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
            {title && <title>{title}</title>}
            <path fill="#365447" opacity=".2" d="M8 36h16v2H8z" />
            {!empty && level >= 1 && <g className="cg-plant-leaves">
                <path fill="#31593c" d={`M15 ${level === 1 ? 21 : level === 2 ? 16 : 7}h2v22h-2z`} />
                {level === 1 ? <><path fill="#91b764" d="M15 24h-5v-2H8v-3h4v2h3zM17 23v-4h3v-2h4v3h-2v2h-3v1z" /><rect x="15" y="20" width="2" height="8" fill="#568450" /></> : <>
                    <Leaf x={16} y={27} light /><Leaf x={16} y={25} flip light />
                    <Leaf x={16} y={20} /><Leaf x={16} y={19} flip />
                    {level >= 3 && <><Leaf x={16} y={13} light /><Leaf x={16} y={12} flip light /><path d="M14 13V6h1V3h2v3h1v7z" fill="#74a753" /><rect x="15" y="5" width="1" height="8" fill="#accb6d" /></>}
                    {level >= 4 && <><path fill={level === 5 ? '#c4bb89' : '#a1b674'} d="M13 5h5v2h2v6h-2v2h-5v-2h-2V8h2zM5 16h4v2h2v4H9v2H5v-2H3v-4h2zM23 14h4v2h2v4h-2v2h-4v-2h-2v-4h2z" /><path fill="#e6d89b" d="M14 6h2v2h-2zM17 10h2v2h-2zM5 17h2v2H5zM25 15h2v2h-2z" /><path fill="#b08769" d="M12 10h2v1h-2zM7 21h2v1H7zM23 18h2v1h-2z" /></>}
                </>}
            </g>}
            <path fill="#663e39" d="M8 28h16v5h-2v5H10v-5H8z" />
            <path fill="#b9654f" d="M9 29h14v4h-2v4H11v-4H9z" />
            <path fill="#df9465" d="M9 29h14v2H9zM11 32h2v4h-2z" />
            <path fill="#814839" d="M11 27h10v2H11z" />
            <path fill="#b98f63" d="M12 27h3v1h-3zM19 28h2v1h-2z" />
            {!empty && level === 0 && <path fill="#d7c17b" d="M15 25h3v3h-3z" />}
            {empty && <g><path fill="#f5eed7" d="M14 17h4v3h3v4h-3v3h-4v-3h-3v-4h3z" /><path fill="#709065" d="M15 18h2v4h3v2h-3v3h-2v-3h-3v-2h3z" /></g>}
            {watered && <g className="cg-water-sparkles" fill="#d9f2f5"><path d="M3 9h2v2H3zM26 4h2v3h-2zM28 25h2v2h-2z" /><path fill="#76bfd2" d="M5 5h2v3H5zM26 20h2v3h-2z" /></g>}
        </svg>
    );
}

export function PlayerSprite({ facing = 'down', walking = false, className = '' }) {
    const back = facing === 'up';
    const side = facing === 'left' || facing === 'right';
    return <svg className={`cg-player-sprite ${walking ? 'is-walking' : ''} ${className}`} viewBox="0 0 16 24" shapeRendering="crispEdges" aria-hidden="true">
        <g transform={facing === 'left' ? 'translate(16 0) scale(-1 1)' : undefined}>
            <path fill="#2f493f" opacity=".25" d="M3 21h10v2H3z" />
            <g className="cg-player-feet"><path fill="#394b43" d="M4 19h3v4H3v-2h1zM9 19h3v2h1v2H9z" /><path fill="#9a815d" d="M4 20h3v1H4zM9 20h3v1H9z" /></g>
            <path fill="#315f52" d="M4 12h8v8H4zM3 13h2v5H3zM11 13h2v5h-2z" />
            <path fill="#669480" d="M5 12h6v6H5z" />
            {back ? <><path fill="#b7b381" d="M6 13h4v6H6z" /><path fill="#736d48" d="M5 14h6v1H5zM5 18h6v2H5z" /></> : <><path fill="#d9c99a" d="M6 12h4v2H6z" /><path fill="#a3b393" d="M6 15h1v3H6zM10 15h1v3h-1z" /></>}
            <path fill="#edbd89" d="M3 17h2v3H3zM11 17h2v3h-2zM4 6h8v6H4z" />
            <path fill="#ba8061" d="M4 10h1v2h6v-1h1v2H5z" />
            {back ? <path fill="#514b3b" d="M4 6h8v5H4zM5 11h6v1H5z" /> : side ? <><path fill="#514b3b" d="M4 6h4v5H4z" /><rect x="11" y="8" width="1" height="2" fill="#30443b" /><path fill="#edbd89" d="M12 9h1v2h-1z" /></> : <><path fill="#514b3b" d="M4 6h2v2H4zM10 6h2v2h-2z" /><path fill="#30443b" d="M6 8h1v2H6zM10 8h1v2h-1z" /></>}
            <path fill="#9e6143" d="M3 4h10v3H2V5h1z" /><path fill="#dba869" d="M4 2h8v2h2v2H2V4h2z" /><path fill="#eed099" d="M5 2h5v1H5zM3 4h10v1H3z" /><path fill="#54735a" d="M4 4h8v1H4z" />
        </g>
    </svg>;
}

export function TreeSprite({ x = 0, y = 0, variant = 0 }) {
    return <svg x={x} y={y} width="32" height="40" viewBox="0 0 32 40" shapeRendering="crispEdges" aria-hidden="true">
        <path fill="#496c4b" opacity=".26" d="M5 33h22v4H5z" /><path fill="#6f573c" d="M13 23h6v12h-6z" /><path fill="#a07d4d" d="M14 25h2v9h-2z" />
        <path fill="#2d5943" d="M10 1h12v3h5v4h3v12h-3v5h-6v3H9v-3H3v-5H1V10h3V5h6z" />
        <path fill={variant ? '#608b51' : '#507d4c'} d="M11 3h10v3h5v5h3v8h-4v5h-6v2H9v-4H4V11h2V7h5z" />
        <path fill={variant ? '#9dbb62' : '#81a556'} d="M11 4h9v2h4v4h-3V8h-6v3H8V8h3zM6 14h5v3H6zM16 16h9v3h-4v3h-6v-3h1z" />
        <path fill="#355e43" d="M11 19h3v3h5v3h-9v-3H6v-3zM24 12h3v4h-3z" />
        {variant === 2 && <path fill="#daab6d" d="M8 11h2v2H8zM22 19h2v2h-2zM16 6h2v2h-2z" />}
    </svg>;
}
