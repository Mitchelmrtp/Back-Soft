// 🔧 Help Service - Business Logic Layer for Help and Support Operations
// Following Service Pattern and Single Responsibility Principle

class HelpService {
  constructor() {
    // Initialize static data - in a real app, this would come from a database
    this.faqData = [
      {
        id: 1,
        question: "¿Cómo puedo subir un recurso?",
        answer: "Para subir un recurso, inicia sesión en tu cuenta, ve a 'Mis Recursos' y haz clic en 'Nuevo Recurso'. Completa el formulario con toda la información necesaria.",
        category: "recursos"
      },
      {
        id: 2,
        question: "¿Qué tipos de archivos puedo subir?",
        answer: "Aceptamos archivos PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX y archivos de imagen (PNG, JPG, JPEG). El tamaño máximo es de 50MB por archivo.",
        category: "archivos"
      },
      {
        id: 3,
        question: "¿Cómo puedo cambiar mi contraseña?",
        answer: "Ve a tu perfil, haz clic en 'Configuración' y luego en 'Cambiar Contraseña'. Ingresa tu contraseña actual y la nueva contraseña.",
        category: "cuenta"
      },
      {
        id: 4,
        question: "¿Los recursos son gratuitos?",
        answer: "Sí, todos los recursos en nuestra plataforma son completamente gratuitos para uso educativo.",
        category: "general"
      },
      {
        id: 5,
        question: "¿Cómo reporto contenido inapropiado?",
        answer: "Puedes reportar contenido inapropiado haciendo clic en el botón 'Reportar' que se encuentra en cada recurso, o contactándonos directamente.",
        category: "moderacion"
      }
    ];

    this.helpArticlesData = [
      {
        id: 1,
        title: "Guía de inicio rápido",
        description: "Aprende los conceptos básicos para usar la plataforma",
        category: "primeros-pasos",
        content: "Esta es una guía completa para nuevos usuarios...",
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-15')
      },
      {
        id: 2,
        title: "Cómo subir recursos educativos",
        description: "Paso a paso para compartir tus materiales",
        category: "recursos",
        content: "Sigue estos pasos para subir tus recursos...",
        created_at: new Date('2024-01-05'),
        updated_at: new Date('2024-01-10')
      },
      {
        id: 3,
        title: "Gestión de tu perfil",
        description: "Personaliza y configura tu cuenta",
        category: "perfil",
        content: "Aprende a personalizar tu perfil...",
        created_at: new Date('2024-01-03'),
        updated_at: new Date('2024-01-12')
      }
    ];

    this.faqCategories = ["general", "recursos", "archivos", "cuenta", "moderacion"];
    this.helpCategories = ["primeros-pasos", "recursos", "perfil", "busqueda", "configuracion"];
    this.validReportTypes = ['bug', 'inappropriate_content', 'copyright_violation', 'spam', 'other'];
  }

  // 🙋 Get FAQ with optional filtering
  async getFAQ(filters = {}) {
    try {
      const { category } = filters;

      let filteredFAQ = [...this.faqData];

      if (category) {
        filteredFAQ = filteredFAQ.filter(item => item.category === category);
      }

      return {
        faq: filteredFAQ,
        categories: this.faqCategories
      };
    } catch (error) {
      throw new Error(`Failed to get FAQ: ${error.message}`);
    }
  }

  // 📝 Submit contact form
  async submitContactForm(contactData) {
    try {
      const { name, email, subject, message, type = 'general' } = contactData;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        throw new Error('Todos los campos son requeridos: name, email, subject, message');
      }

      // Basic email validation
      if (!this._isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      // In a real application, you would:
      // 1. Save the contact form to a database
      // 2. Send an email notification to admins
      // 3. Send a confirmation email to the user
      
      const ticketId = this._generateTicketId();
      
      // Log the submission (in production, save to database)
      this._logContactSubmission({
        name,
        email,
        subject,
        message,
        type,
        ticketId,
        timestamp: new Date()
      });

      return {
        message: 'Tu mensaje ha sido enviado exitosamente. Te responderemos pronto.',
        ticketId
      };
    } catch (error) {
      throw new Error(`Failed to submit contact form: ${error.message}`);
    }
  }

  // 📚 Get help articles with filtering and search
  async getHelpArticles(filters = {}) {
    try {
      const { category, search } = filters;

      let filteredArticles = [...this.helpArticlesData];

      // Filter by category
      if (category) {
        filteredArticles = filteredArticles.filter(article => article.category === category);
      }

      // Filter by search term
      if (search) {
        filteredArticles = this._searchArticles(filteredArticles, search);
      }

      return {
        articles: filteredArticles,
        categories: this.helpCategories
      };
    } catch (error) {
      throw new Error(`Failed to get help articles: ${error.message}`);
    }
  }

  // 📖 Get specific help article
  async getHelpArticle(articleId) {
    try {
      const id = parseInt(articleId);

      // In a real application, fetch from database
      const article = {
        id,
        title: "Artículo de ayuda",
        description: "Descripción del artículo",
        category: "general",
        content: this._generateArticleContent(id),
        created_at: new Date(),
        updated_at: new Date(),
        views: 150
      };

      if (!article || id <= 0) {
        throw new Error('Artículo no encontrado');
      }

      return { article };
    } catch (error) {
      throw new Error(`Failed to get help article: ${error.message}`);
    }
  }

  // 🚨 Report a problem
  async reportProblem(reportData, userId = null) {
    try {
      const { 
        type, 
        description, 
        resource_id, 
        url, 
        browser_info,
        steps_to_reproduce 
      } = reportData;

      if (!type || !description) {
        throw new Error('El tipo y la descripción son requeridos');
      }

      if (!this.validReportTypes.includes(type)) {
        throw new Error(`Tipo de reporte inválido. Tipos válidos: ${this.validReportTypes.join(', ')}`);
      }

      const reportId = this._generateReportId();

      // In a real application, save to database and notify moderators
      this._logProblemReport({
        type,
        description,
        resource_id,
        url,
        browser_info,
        steps_to_reproduce,
        user_id: userId,
        reportId,
        timestamp: new Date()
      });

      return {
        message: 'Reporte enviado exitosamente. Nuestro equipo lo revisará pronto.',
        reportId
      };
    } catch (error) {
      throw new Error(`Failed to report problem: ${error.message}`);
    }
  }

  // 🟢 Get system status
  async getSystemStatus() {
    try {
      // In a real application, you would check various system components
      const status = {
        overall: 'operational',
        services: {
          api: {
            status: 'operational',
            response_time: '120ms'
          },
          database: {
            status: 'operational',
            response_time: '25ms'
          },
          file_uploads: {
            status: 'operational',
            response_time: '300ms'
          },
          search: {
            status: 'operational',
            response_time: '80ms'
          }
        },
        last_updated: new Date(),
        incidents: [] // Recent incidents would go here
      };

      return { status };
    } catch (error) {
      throw new Error(`Failed to get system status: ${error.message}`);
    }
  }

  // 🔍 Private helper methods

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  _generateTicketId() {
    return `TICKET-${Date.now()}`;
  }

  _generateReportId() {
    return `REPORT-${Date.now()}`;
  }

  _searchArticles(articles, searchTerm) {
    const term = searchTerm.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.description.toLowerCase().includes(term)
    );
  }

  _generateArticleContent(id) {
    return `
# Artículo de Ayuda ${id}

Este es el contenido completo del artículo de ayuda número ${id}.

## Sección 1
Contenido de la primera sección...

## Sección 2
Contenido de la segunda sección...

### Subsección
Más detalles aquí...
    `.trim();
  }

  _logContactSubmission(data) {
    console.log('Contact form submission received:', { email: data.email, subject: data.subject });
    // In production: save to database, send notifications
  }

  _logProblemReport(data) {
    console.log('Problem report received:', { type: data.type, priority: data.priority });
    // In production: save to database, notify moderators
  }
}

export default new HelpService();