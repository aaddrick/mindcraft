// Add at top of file
import { existsSync, statSync } from 'fs';

export class Prompter {
    constructor(agent, fp) {
        // ... existing constructor code ...
        
        this.exampleCache = {
            convo: null,
            coding: null,
            lastUpdated: 0
        };
    }

    // Add validation to getInitModes()
    getInitModes() {
        if (!this.profile.modes) {
            console.warn('No modes defined in profile, using defaults');
            return this.default_profile.modes;
        }
        
        // Validate required modes
        const requiredModes = ['self_preservation', 'unstuck', 'self_defense'];
        for (const mode of requiredModes) {
            if (this.profile.modes[mode] === undefined) {
                console.warn(`Missing required mode: ${mode}, defaulting to true`);
                this.profile.modes[mode] = true;
            }
        }
        
        return this.profile.modes;
    }

    // Add caching to initExamples()
    initExamples() {
        const now = Date.now();
        const cacheTtl = this.profile.example_cache_ttl || 60000;
        
        // Check if cached examples are still valid
        if (this.exampleCache.convo && 
            this.exampleCache.coding &&
            (now - this.exampleCache.lastUpdated) < cacheTtl) {
            return {
                convo: this.exampleCache.convo,
                coding: this.exampleCache.coding
            };
        }
        
        // Initialize examples as before
        let convo_examples = this.profile.conversation_examples;
        let coding_examples = this.profile.coding_examples;
        
        // Update cache
        this.exampleCache = {
            convo: convo_examples,
            coding: coding_examples,
            lastUpdated: now
        };
        
        return {
            convo: convo_examples,
            coding: coding_examples
        };
    }

    // Add more robust template validation
    replaceStrings(str, replacements) {
        if (typeof str !== 'string') {
            throw new Error('Template must be a string');
        }
        
        return str.replace(/\$(\w+)/g, (_, key) => {
            if (!replacements.hasOwnProperty(key)) {
                console.warn(`Missing template variable: ${key}`);
                return '';
            }
            return replacements[key];
        });
    }

    // Make cooldown configurable
    checkCooldown() {
        const cooldown = this.profile.cooldown || this.default_profile.cooldown;
        const now = Date.now();
        
        if (now - this.last_prompt_time < cooldown) {
            return false;
        }
        
        this.last_prompt_time = now;
        return true;
    }

    // ... rest of methods remain unchanged ...
}
