// 🎮 Help Controller - Request/Response Layer for Help and Support
// Following Controller Pattern and Single Responsibility Principle

import HelpService from '../services/HelpService.js';

// Get FAQ (Frequently Asked Questions)
export const getFAQ = async (req, res) => {
    try {
        const filters = req.query;
        const result = await HelpService.getFAQ(filters);
        res.json(result);
    } catch (error) {
        console.error('Get FAQ error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Submit contact form
export const submitContactForm = async (req, res) => {
    try {
        const contactData = req.body;
        const result = await HelpService.submitContactForm(contactData);
        res.status(201).json(result);
    } catch (error) {
        console.error('Submit contact form error:', error);
        const statusCode = error.message.includes('requeridos') || error.message.includes('inválido') ? 400 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// Get help articles/guides
export const getHelpArticles = async (req, res) => {
    try {
        const filters = req.query;
        const result = await HelpService.getHelpArticles(filters);
        res.json(result);
    } catch (error) {
        console.error('Get help articles error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get specific help article
export const getHelpArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await HelpService.getHelpArticle(id);
        res.json(result);
    } catch (error) {
        console.error('Get help article error:', error);
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// Report a problem
export const reportProblem = async (req, res) => {
    try {
        const reportData = req.body;
        const userId = req.user?.userId;
        
        const result = await HelpService.reportProblem(reportData, userId);
        res.status(201).json(result);
    } catch (error) {
        console.error('Report problem error:', error);
        const statusCode = error.message.includes('requeridos') || error.message.includes('inválido') ? 400 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// Get system status
export const getSystemStatus = async (req, res) => {
    try {
        const result = await HelpService.getSystemStatus();
        res.json(result);
    } catch (error) {
        console.error('Get system status error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};