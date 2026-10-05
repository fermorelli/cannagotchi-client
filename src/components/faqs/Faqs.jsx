import { Link } from 'react-router-dom';
import './faqs.css';
import { Footer } from '../footer/Footer';

const questions = [
    ['Do I have to walk around to manage my plants?', 'Walking is optional. Garden lets you visit a plant by tapping it or selecting it from the list. Classic gives you direct access to the same collection, details, and plant forms.'],
    ['Where are the rest of my plants?', 'Each garden has space for six plants. Use the garden selector above the map to reach the next garden. The plant list includes your whole collection, and opening a plant selects its garden automatically.'],
    ['What is the difference between my account and a local garden?', 'Your account loads the same collection as the deployed app. A local garden starts with three examples and saves plants in this browser. Those examples stay separate from your account plants.'],
    ['Where are my care notes saved?', 'Watering, feeding, observations, measurements, and observed stages are saved in this browser for your current account. They do not sync between devices. Clearing site storage removes these notes and any local garden records.'],
    ['How does the plant appearance change?', 'The garden estimates a visual stage from the germination date. You can choose an observed growth stage in the notebook to match your real plant. The sprite is a visual record, not a plant health assessment.'],
    ['What happens when I harvest a plant?', 'Harvest plant opens a confirmation. Harvest and remove permanently deletes its plant record from Garden and Classic. For an account plant, this also removes it from the deployed app. Its browser care notes are retained, but stop appearing in the garden.'],
    ['How do I move and interact?', 'Focus the map and use the arrow keys or WASD. Press E or Space next to a plant or an empty pot. On touch screens, use the direction buttons or tap a plant. Every plant is also available from the list beside or below the map.'],
];

export const Faqs = () => (
    <>
        <main className="faqs-page container">
            <header className="faqs-heading">
                <span className="section-label">Help with Cannagotchi</span>
                <h1>Your garden, explained.</h1>
                <p>A few answers about your plants, records, and the two ways to use Cannagotchi.</p>
            </header>
            <div className="faqs-list">
                {questions.map(([question, answer]) => <details className="faqs-item" key={question}>
                    <summary>{question}</summary><p>{answer}</p>
                </details>)}
            </div>
            <Link className="workspace-button workspace-button--secondary" to="/garden">Open the garden</Link>
        </main>
        <Footer />
    </>
);
