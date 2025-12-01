import sequelize from '../config/database.js';
import {
  User,
  Category,
  Faculty,
  Career,
  Course,
  AcademicPeriod,
  Resource,
  Comment,
  ResourceLike,
  Permission,
  UserPermission
} from '../models/index.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('🚀 Iniciando seed de la base de datos...');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('\n🧹 Limpiando datos existentes...');
    await UserPermission.destroy({ where: {}, force: true });
    await Permission.destroy({ where: {}, force: true });
    await ResourceLike.destroy({ where: {}, force: true });
    await Comment.destroy({ where: {}, force: true });
    await Resource.destroy({ where: {}, force: true });
    await Course.destroy({ where: {}, force: true });
    await AcademicPeriod.destroy({ where: {}, force: true });
    await Career.destroy({ where: {}, force: true });
    await Faculty.destroy({ where: {}, force: true });
    await Category.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    console.log('✅ Datos anteriores eliminados');

    console.log('\n👥 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.bulkCreate([
      {
        name: 'Admin Usuario',
        email: 'admin@universidad.edu',
        password: hashedPassword,
        role: 'admin',
        employee_id: 'EMP001',
        is_verified: true,
        status: 'active'
      },
      {
        name: 'Prof. Juan Pérez',
        email: 'juan.perez@universidad.edu',
        password: hashedPassword,
        role: 'teacher',
        employee_id: 'DOC001',
        is_verified: true,
        status: 'active'
      },
      {
        name: 'María García',
        email: 'maria.garcia@universidad.edu',
        password: hashedPassword,
        role: 'student',
        student_id: '2021001',
        is_verified: true,
        status: 'active'
      },
      {
        name: 'Carlos López',
        email: 'carlos.lopez@universidad.edu',
        password: hashedPassword,
        role: 'student',
        student_id: '2021002',
        is_verified: true,
        status: 'active'
      },
      {
        name: 'Ana Martínez',
        email: 'ana.martinez@universidad.edu',
        password: hashedPassword,
        role: 'student',
        student_id: '2021003',
        is_verified: true,
        status: 'active'
      }
    ]);
    console.log(`✅ ${users.length} usuarios creados`);

    // 2. CATEGORÍAS
    console.log('\n📁 Creando categorías...');
    const categories = await Category.bulkCreate([
      {
        name: 'Matemáticas',
        description: 'Recursos de matemáticas y cálculo',
        category_type: 'subject_area',
        status: 'active',
        sort_order: 1
      },
      {
        name: 'Programación',
        description: 'Recursos de programación y desarrollo',
        category_type: 'subject_area',
        status: 'active',
        sort_order: 2
      },
      {
        name: 'Física',
        description: 'Recursos de física',
        category_type: 'subject_area',
        status: 'active',
        sort_order: 3
      },
      {
        name: 'Química',
        description: 'Recursos de química',
        category_type: 'subject_area',
        status: 'active',
        sort_order: 4
      },
      {
        name: 'Ingeniería',
        description: 'Recursos de ingeniería',
        category_type: 'subject_area',
        status: 'active',
        sort_order: 5
      }
    ]);
    console.log(`✅ ${categories.length} categorías creadas`);

    // 3. FACULTADES
    console.log('\n🏛️ Creando facultades...');
    const faculties = await Faculty.bulkCreate([
      {
        name: 'Facultad de Ingeniería',
        code: 'FING',
        description: 'Facultad de Ingeniería y Tecnología',
        status: 'active'
      },
      {
        name: 'Facultad de Ciencias',
        code: 'FCIE',
        description: 'Facultad de Ciencias Básicas',
        status: 'active'
      },
      {
        name: 'Facultad de Administración',
        code: 'FADM',
        description: 'Facultad de Administración y Negocios',
        status: 'active'
      }
    ]);
    console.log(`✅ ${faculties.length} facultades creadas`);

    // 4. CARRERAS
    console.log('\n🎓 Creando carreras...');
    const careers = await Career.bulkCreate([
      {
        name: 'Ingeniería de Sistemas',
        code: 'INGS',
        description: 'Ingeniería de Sistemas e Informática',
        faculty_id: faculties[0].id,
        duration_semesters: 10,
        degree_type: 'bachelor',
        status: 'active'
      },
      {
        name: 'Ingeniería Industrial',
        code: 'INGI',
        description: 'Ingeniería Industrial',
        faculty_id: faculties[0].id,
        duration_semesters: 10,
        degree_type: 'bachelor',
        status: 'active'
      },
      {
        name: 'Matemáticas',
        code: 'MAT',
        description: 'Licenciatura en Matemáticas',
        faculty_id: faculties[1].id,
        duration_semesters: 10,
        degree_type: 'bachelor',
        status: 'active'
      },
      {
        name: 'Administración de Empresas',
        code: 'ADME',
        description: 'Administración de Empresas',
        faculty_id: faculties[2].id,
        duration_semesters: 10,
        degree_type: 'bachelor',
        status: 'active'
      }
    ]);
    console.log(`✅ ${careers.length} carreras creadas`);

    // 5. CURSOS
    console.log('\n📚 Creando cursos...');
    const courses = await Course.bulkCreate([
      {
        name: 'Cálculo I',
        code: 'MAT101',
        description: 'Introducción al cálculo diferencial e integral',
        credits: 4,
        semester: 1,
        course_type: 'obligatory',
        hours_theory: 3,
        hours_practice: 2,
        career_id: careers[0].id,
        teacher_id: users[1].id,
        status: 'active'
      },
      {
        name: 'Programación I',
        code: 'CS101',
        description: 'Fundamentos de programación',
        credits: 4,
        semester: 1,
        course_type: 'obligatory',
        hours_theory: 2,
        hours_practice: 3,
        career_id: careers[0].id,
        teacher_id: users[1].id,
        status: 'active'
      },
      {
        name: 'Física I',
        code: 'FIS101',
        description: 'Mecánica y termodinámica',
        credits: 4,
        semester: 2,
        course_type: 'obligatory',
        hours_theory: 3,
        hours_practice: 2,
        career_id: careers[0].id,
        teacher_id: users[1].id,
        status: 'active'
      },
      {
        name: 'Base de Datos',
        code: 'CS201',
        description: 'Diseño y gestión de bases de datos',
        credits: 4,
        semester: 3,
        course_type: 'obligatory',
        hours_theory: 2,
        hours_practice: 3,
        career_id: careers[0].id,
        teacher_id: users[1].id,
        status: 'active'
      },
      {
        name: 'Algoritmos y Estructuras de Datos',
        code: 'CS102',
        description: 'Estructuras de datos y algoritmos fundamentales',
        credits: 4,
        semester: 2,
        course_type: 'obligatory',
        hours_theory: 2,
        hours_practice: 3,
        career_id: careers[0].id,
        teacher_id: users[1].id,
        status: 'active'
      }
    ]);
    console.log(`✅ ${courses.length} cursos creados`);

    // 6. PERÍODOS ACADÉMICOS
    console.log('\n📅 Creando períodos académicos...');
    const periods = await AcademicPeriod.bulkCreate([
      {
        name: '2024-1',
        code: '2024-1',
        type: 'semester',
        academic_year: 2024,
        period_number: 1,
        start_date: '2024-03-01',
        end_date: '2024-07-31',
        enrollment_start: '2024-01-15',
        enrollment_end: '2024-02-15',
        status: 'completed'
      },
      {
        name: '2024-2',
        code: '2024-2',
        type: 'semester',
        academic_year: 2024,
        period_number: 2,
        start_date: '2024-08-01',
        end_date: '2024-12-20',
        enrollment_start: '2024-06-15',
        enrollment_end: '2024-07-15',
        status: 'completed'
      },
      {
        name: '2025-1',
        code: '2025-1',
        type: 'semester',
        academic_year: 2025,
        period_number: 1,
        start_date: '2025-03-01',
        end_date: '2025-07-31',
        enrollment_start: '2025-01-15',
        enrollment_end: '2025-02-15',
        status: 'active'
      }
    ]);
    console.log(`✅ ${periods.length} períodos académicos creados`);

    // 7. RECURSOS
    console.log('\n📄 Creando recursos...');
    const resources = await Resource.bulkCreate([
      {
        title: 'Apuntes de Cálculo I - Derivadas',
        description: 'Apuntes completos sobre derivadas y sus aplicaciones',
        content: 'Contenido detallado sobre derivadas: definición, reglas de derivación, aplicaciones...',
        type: 'document',
        format: 'pdf',
        file_path: '/uploads/calculo1-derivadas.pdf',
        file_size: 1024000,
        status: 'published',
        visibility: 'public',
        academic_year: 2025,
        semester: 1,
        topic: 'Derivadas',
        user_id: users[2].id,
        category_id: categories[0].id,
        course_id: courses[0].id,
        views_count: 45,
        downloads_count: 12,
        likes_count: 8,
        published_at: new Date()
      },
      {
        title: 'Ejercicios Resueltos - Programación I',
        description: 'Colección de ejercicios resueltos de programación básica',
        content: 'Ejercicios sobre variables, estructuras de control, funciones...',
        type: 'document',
        format: 'pdf',
        file_path: '/uploads/programacion1-ejercicios.pdf',
        file_size: 856000,
        status: 'published',
        visibility: 'public',
        academic_year: 2025,
        semester: 1,
        topic: 'Fundamentos de Programación',
        user_id: users[3].id,
        category_id: categories[1].id,
        course_id: courses[1].id,
        views_count: 67,
        downloads_count: 23,
        likes_count: 15,
        published_at: new Date()
      },
      {
        title: 'Examen Parcial - Física I (2024-2)',
        description: 'Examen parcial de Física I con soluciones',
        content: 'Examen sobre mecánica: cinemática, dinámica, trabajo y energía...',
        type: 'document',
        format: 'pdf',
        file_path: '/uploads/fisica1-examen-parcial.pdf',
        file_size: 512000,
        status: 'published',
        visibility: 'public',
        academic_year: 2024,
        semester: 2,
        topic: 'Mecánica',
        user_id: users[4].id,
        category_id: categories[2].id,
        course_id: courses[2].id,
        views_count: 89,
        downloads_count: 34,
        likes_count: 21,
        published_at: new Date()
      },
      {
        title: 'Guía de Laboratorio - Base de Datos',
        description: 'Guía práctica para laboratorio de bases de datos',
        content: 'Ejercicios prácticos sobre SQL, normalización, diseño de BD...',
        type: 'document',
        format: 'pdf',
        file_path: '/uploads/bd-laboratorio.pdf',
        file_size: 1536000,
        status: 'published',
        visibility: 'public',
        academic_year: 2025,
        semester: 1,
        topic: 'SQL y Consultas',
        user_id: users[2].id,
        category_id: categories[1].id,
        course_id: courses[3].id,
        views_count: 52,
        downloads_count: 18,
        likes_count: 11,
        published_at: new Date()
      },
      {
        title: 'Resumen - Algoritmos de Ordenamiento',
        description: 'Resumen de principales algoritmos de ordenamiento',
        content: 'Bubble Sort, Quick Sort, Merge Sort: complejidad y aplicaciones...',
        type: 'document',
        format: 'pdf',
        file_path: '/uploads/algoritmos-ordenamiento.pdf',
        file_size: 768000,
        status: 'published',
        visibility: 'public',
        academic_year: 2025,
        semester: 1,
        topic: 'Algoritmos de Ordenamiento',
        user_id: users[3].id,
        category_id: categories[1].id,
        course_id: courses[4].id,
        views_count: 73,
        downloads_count: 28,
        likes_count: 19,
        published_at: new Date()
      }
    ]);
    console.log(`✅ ${resources.length} recursos creados`);

    // 8. COMENTARIOS
    console.log('\n💬 Creando comentarios...');
    const comments = await Comment.bulkCreate([
      {
        content: 'Excelentes apuntes, muy claros y bien explicados!',
        user_id: users[3].id,
        resource_id: resources[0].id,
        status: 'published',
        likes_count: 3
      },
      {
        content: 'Me ayudó mucho para el examen, gracias por compartir',
        user_id: users[4].id,
        resource_id: resources[0].id,
        status: 'published',
        likes_count: 2
      },
      {
        content: 'Los ejercicios están muy bien, podrías subir más?',
        user_id: users[2].id,
        resource_id: resources[1].id,
        status: 'published',
        likes_count: 5
      },
      {
        content: 'Gracias! Me sirvió para practicar',
        user_id: users[4].id,
        resource_id: resources[1].id,
        status: 'published',
        likes_count: 1
      },
      {
        content: 'Buen material de estudio',
        user_id: users[2].id,
        resource_id: resources[2].id,
        status: 'published',
        likes_count: 4
      }
    ]);
    console.log(`✅ ${comments.length} comentarios creados`);

    // 9. LIKES EN RECURSOS
    console.log('\n❤️ Creando likes en recursos...');
    const resourceLikes = await ResourceLike.bulkCreate([
      { user_id: users[2].id, resource_id: resources[1].id },
      { user_id: users[3].id, resource_id: resources[0].id },
      { user_id: users[4].id, resource_id: resources[0].id },
      { user_id: users[2].id, resource_id: resources[2].id },
      { user_id: users[3].id, resource_id: resources[1].id },
      { user_id: users[4].id, resource_id: resources[3].id },
      { user_id: users[2].id, resource_id: resources[4].id },
      { user_id: users[3].id, resource_id: resources[4].id }
    ]);
    console.log(`✅ ${resourceLikes.length} likes en recursos creados`);

    // 10. PERMISOS
    console.log('\n🔐 Creando permisos...');
    const permissions = await Permission.bulkCreate([
      {
        name: 'upload_resources',
        description: 'Permiso para subir recursos',
        permission_type: 'upload_resource',
        default_roles: ['student', 'teacher'],
        status: 'active'
      },
      {
        name: 'moderate_resources',
        description: 'Permiso para moderar recursos',
        permission_type: 'moderate_resources',
        default_roles: ['admin', 'teacher'],
        status: 'active'
      },
      {
        name: 'manage_courses',
        description: 'Permiso para gestionar cursos',
        permission_type: 'manage_courses',
        default_roles: ['admin'],
        status: 'active'
      },
      {
        name: 'manage_users',
        description: 'Permiso para gestionar usuarios',
        permission_type: 'manage_users',
        default_roles: ['admin'],
        status: 'active'
      }
    ]);
    console.log(`✅ ${permissions.length} permisos creados`);

    // 11. PERMISOS DE USUARIO
    console.log('\n👤 Asignando permisos a usuarios...');
    const userPermissions = await UserPermission.bulkCreate([
      {
        user_id: users[0].id, // Admin
        permission_id: permissions[0].id,
        granted_by: users[0].id
      },
      {
        user_id: users[0].id, // Admin
        permission_id: permissions[1].id,
        granted_by: users[0].id
      },
      {
        user_id: users[0].id, // Admin
        permission_id: permissions[2].id,
        granted_by: users[0].id
      },
      {
        user_id: users[0].id, // Admin
        permission_id: permissions[3].id,
        granted_by: users[0].id
      },
      {
        user_id: users[1].id, // Profesor
        permission_id: permissions[0].id,
        granted_by: users[0].id
      },
      {
        user_id: users[1].id, // Profesor
        permission_id: permissions[1].id,
        granted_by: users[0].id
      }
    ]);
    console.log(`✅ ${userPermissions.length} permisos de usuario asignados`);

    console.log('\n✨ ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${users.length} usuarios`);
    console.log(`   - ${categories.length} categorías`);
    console.log(`   - ${faculties.length} facultades`);
    console.log(`   - ${careers.length} carreras`);
    console.log(`   - ${courses.length} cursos`);
    console.log(`   - ${periods.length} períodos académicos`);
    console.log(`   - ${resources.length} recursos`);
    console.log(`   - ${comments.length} comentarios`);
    console.log(`   - ${resourceLikes.length} likes`);
    console.log(`   - ${permissions.length} permisos`);
    console.log(`   - ${userPermissions.length} permisos de usuario`);
    
    console.log('\n🔑 Credenciales de prueba:');
    console.log('   Admin:     admin@universidad.edu / password123');
    console.log('   Profesor:  juan.perez@universidad.edu / password123');
    console.log('   Estudiante: maria.garcia@universidad.edu / password123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log('\n👋 Conexión cerrada');
    process.exit(0);
  }
};

// Ejecutar el seed
seedDatabase();
