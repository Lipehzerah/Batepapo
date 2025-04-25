// Configurações globais
const CHAT_CONFIG = {
    botCount: 50,
    messageDelay: 1000, // Intervalo entre mensagens dos bots (ms)
    learningRate: 0.7, // Taxa de aprendizado (0 a 1)
    humanLikeDelay: true, // Atraso humano nas respostas
    typingSpeed: 50, // Velocidade de digitação (ms por caractere)
    emojiProbability: 0.3, // Probabilidade de usar emoji
    mediaProbability: 0.1, // Probabilidade de enviar mídia
    initialTopics: [
        "tecnologia", "programação", "jogos", "filmes", "música", 
        "esportes", "viagens", "comida", "relacionamentos", "IA"
    ]
};

// Estado do aplicativo
let appState = {
    currentUser: null,
    bots: [],
    messages: [],
    privateMessages: {},
    onlineUsers: [],
    activePrivateChat: null,
    emojis: ["😀", "😂", "😍", "🤔", "😎", "🙄", "😢", "😡", "🤯", "👋", 
             "👍", "👎", "❤️", "🔥", "🎉", "🤖", "💻", "🎮", "🍕", "🚀"],
    mediaLibrary: [
        "assets/media/tech1.jpg",
        "assets/media/game1.jpg",
        "assets/media/food1.jpg",
        "assets/media/travel1.jpg",
        "assets/media/cat.gif",
        "assets/media/funny.mp4"
    ],
    sounds: {
        message: "assets/sounds/message.mp3",
        join: "assets/sounds/join.mp3",
        leave: "assets/sounds/leave.mp3"
    }
};

// Inicialização do chat
document.addEventListener('DOMContentLoaded', function() {
    // Eventos da tela de login
    document.getElementById('enter-chat').addEventListener('click', enterChat);
    
    // Eventos do chat
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Eventos de ferramentas
    document.getElementById('emoji-btn').addEventListener('click', toggleEmojiPicker);
    document.getElementById('media-btn').addEventListener('click', () => document.getElementById('file-input').click());
    document.getElementById('file-input').addEventListener('change', handleFileUpload);
    document.getElementById('sound-btn').addEventListener('click', toggleSound);
    
    // Eventos do modal privado
    document.getElementById('close-private-chat').addEventListener('click', closePrivateChat);
    document.getElementById('send-private-btn').addEventListener('click', sendPrivateMessage);
    document.getElementById('private-message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendPrivateMessage();
    });
    
    // Inicializar bots (será chamado após o login)
});

// Entrar no chat
function enterChat() {
    const username = document.getElementById('username').value.trim();
    const usercolor = document.getElementById('usercolor').value;
    
    if (!username) {
        alert('Por favor, escolha um nick!');
        return;
    }
    
    appState.currentUser = {
        id: generateId(),
        username,
        color: usercolor,
        isBot: false,
        online: true,
        avatar: generateAvatar(username)
    };
    
    // Esconder tela de login e mostrar chat
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('chat-container').classList.remove('hidden');
    
    // Inicializar bots
    initializeBots();
    
    // Adicionar usuário à lista
    addUserToList(appState.currentUser);
    
    // Simular entrada de usuários
    simulateUserActivity();
    
    // Rolagem automática
    setupAutoScroll();
    
    // Notificação de entrada
    playSound('join');
    addSystemMessage(`${username} entrou no chat!`);
}

// Inicializar bots
function initializeBots() {
    for (let i = 0; i < CHAT_CONFIG.botCount; i++) {
        const bot = createBot();
        appState.bots.push(bot);
        addUserToList(bot);
        
        // Iniciar comportamento do bot
        startBotBehavior(bot);
    }
}

// Criar um bot com personalidade única
function createBot() {
    const personalities = ['amigável', 'engraçado', 'sarcástico', 'romântico', 'nerd', 'artístico'];
    const hobbies = ['programação', 'jogos', 'música', 'filmes', 'esportes', 'viagens', 'culinária'];
    const moods = ['feliz', 'neutro', 'curioso', 'animado', 'relaxado'];
    
    const username = generateBotName();
    const personality = randomChoice(personalities);
    const hobby = randomChoice(hobbies);
    const mood = randomChoice(moods);
    
    return {
        id: generateId(),
        username,
        color: generateRandomColor(),
        isBot: true,
        online: true,
        avatar: generateAvatar(username),
        personality,
        hobby,
        mood,
        knowledge: CHAT_CONFIG.initialTopics,
        memory: [],
        responsePattern: generateResponsePattern(personality),
        typing: false
    };
}

// Padrão de resposta baseado na personalidade
function generateResponsePattern(personality) {
    const patterns = {
        'amigável': { emoji: 0.4, questions: 0.3, positivity: 0.8 },
        'engraçado': { emoji: 0.6, jokes: 0.7, positivity: 0.7 },
        'sarcástico': { emoji: 0.2, sarcasm: 0.8, positivity: 0.4 },
        'romântico': { emoji: 0.5, compliments: 0.6, positivity: 0.9 },
        'nerd': { emoji: 0.1, facts: 0.7, positivity: 0.6 },
        'artístico': { emoji: 0.3, creativity: 0.8, positivity: 0.7 }
    };
    
    return patterns[personality] || patterns['amigável'];
}

// Comportamento do bot
function startBotBehavior(bot) {
    // Intervalo aleatório para parecer mais natural
    const delay = randomBetween(CHAT_CONFIG.messageDelay, CHAT_CONFIG.messageDelay * 3);
    
    setTimeout(() => {
        if (Math.random() < 0.8) { // 80% de chance de enviar mensagem
            sendBotMessage(bot);
        }
        startBotBehavior(bot); // Continuar o ciclo
    }, delay);
}

// Enviar mensagem como bot
function sendBotMessage(bot) {
    if (bot.typing) return;
    
    const messageType = Math.random();
    let messageContent = '';
    
    // Decidir o tipo de mensagem baseado na personalidade
    if (messageType < 0.6) {
        // Mensagem normal
        messageContent = generateBotMessage(bot);
    } else if (messageType < 0.8) {
        // Mensagem com emoji
        messageContent = generateBotMessage(bot) + ' ' + randomChoice(appState.emojis);
    } else if (messageType < 0.95 && appState.mediaLibrary.length > 0) {
        // Mensagem com mídia
        messageContent = generateBotMessage(bot);
        const mediaUrl = randomChoice(appState.mediaLibrary);
        sendMessageToChat(bot, messageContent, mediaUrl);
        return;
    } else {
        // GIF ou sticker
        messageContent = randomChoice(appState.emojis) + ' ' + generateBotMessage(bot);
    }
    
    // Simular digitação
    simulateTyping(bot, () => {
        sendMessageToChat(bot, messageContent);
    });
}

// Gerar mensagem do bot
function generateBotMessage(bot) {
    const topics = [...CHAT_CONFIG.initialTopics, bot.hobby];
    const currentTopic = randomChoice(topics);
    
    // Baseado na personalidade e humor
    let message = '';
    
    if (bot.personality === 'amigável') {
        const phrases = [
            `Eu adoro conversar sobre ${currentTopic}! E você?`,
            `Você já experimentou algo novo em ${currentTopic} recentemente?`,
            `Estou me sentindo muito ${bot.mood} hoje! Como está seu dia?`,
            `Alguém aqui também gosta de ${currentTopic}?`,
            `O que vocês acham sobre ${currentTopic}?`
        ];
        message = randomChoice(phrases);
    } else if (bot.personality === 'engraçado') {
        const jokes = {
            'programação': 'Por que o programador morreu de fome? Porque ele não conseguiu sair do loop while!',
            'jogos': 'Sabem qual é o jogo favorito do esqueleto? Tibia!',
            'música': 'Por que a música foi presa? Porque ela tinha muitos acordes!',
            'IA': 'Por que a IA não briga com ninguém? Porque ela evita conflitos!'
        };
        
        message = jokes[currentTopic] || `Estou me sentindo ${bot.mood} hoje! Alguém tem uma piada sobre ${currentTopic}?`;
    } else if (bot.personality === 'sarcástico') {
        message = `Oh, ótimo, mais uma conversa sobre ${currentTopic}. Exatamente o que eu sempre quis.`;
    } else if (bot.personality === 'romântico') {
        message = `O mundo seria melhor com mais ${currentTopic} e amor. Alguém concorda?`;
    } else if (bot.personality === 'nerd') {
        const facts = {
            'programação': 'Sabiam que o primeiro bug de computador foi um inseto real encontrado em um relé em 1947?',
            'IA': 'Aprendizado por reforço é usado para treinar AIs através de recompensas e punições, como ensinar um cachorro.',
            'jogos': 'O jogo mais caro já desenvolvido foi Star Citizen, custando mais de $300 milhões até agora.'
        };
        message = facts[currentTopic] || `Vocês sabiam que ${currentTopic} é fascinante quando você estuda a fundo?`;
    } else { // artístico
        message = `Estou me inspirando em ${currentTopic} para meu próximo projeto criativo. Alguém mais sente isso?`;
    }
    
    // Aprendizado: adicionar novo conhecimento ocasionalmente
    if (Math.random() < 0.1 && !bot.knowledge.includes(currentTopic)) {
        bot.knowledge.push(currentTopic);
    }
    
    return message;
}

// Simular digitação
function simulateTyping(bot, callback) {
    bot.typing = true;
    updateUserStatus(bot);
    
    // Tempo de digitação baseado no comprimento da mensagem (simulado)
    const typingTime = randomBetween(1000, 3000);
    
    setTimeout(() => {
        bot.typing = false;
        updateUserStatus(bot);
        callback();
    }, typingTime);
}

// Enviar mensagem do usuário
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message && !appState.currentFile) return;
    
    // Enviar mensagem para o chat
    sendMessageToChat(appState.currentUser, message, appState.currentFile);
    
    // Processar resposta dos bots
    processBotResponses(message);
    
    // Limpar input
    input.value = '';
    appState.currentFile = null;
}

// Enviar mensagem privada
function sendPrivateMessage() {
    if (!appState.activePrivateChat) return;
    
    const input = document.getElementById('private-message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const privateMessage = {
        sender: appState.currentUser,
        receiver: appState.activePrivateChat,
        content: message,
        timestamp: new Date()
    };
    
    // Adicionar à lista de mensagens privadas
    if (!appState.privateMessages[appState.activePrivateChat.id]) {
        appState.privateMessages[appState.activePrivateChat.id] = [];
    }
    appState.privateMessages[appState.activePrivateChat.id].push(privateMessage);
    
    // Exibir no chat privado
    displayPrivateMessage(privateMessage, true);
    
    // Limpar input
    input.value = '';
    
    // Se for um bot, responder
    if (appState.activePrivateChat.isBot) {
        setTimeout(() => {
            const botResponse = generatePrivateBotResponse(appState.activePrivateChat, message);
            const responseMessage = {
                sender: appState.activePrivateChat,
                receiver: appState.currentUser,
                content: botResponse,
                timestamp: new Date()
            };
            
            appState.privateMessages[appState.activePrivateChat.id].push(responseMessage);
            displayPrivateMessage(responseMessage, false);
        }, randomBetween(1000, 3000));
    }
}

// Gerar resposta privada do bot
function generatePrivateBotResponse(bot, message) {
    // Análise simples da mensagem
    const lowerMsg = message.toLowerCase();
    let response = '';
    
    if (lowerMsg.includes('oi') || lowerMsg.includes('olá') || lowerMsg.includes('ola')) {
        response = `Olá ${appState.currentUser.username}! Como você está?`;
    } else if (lowerMsg.includes('como você está')) {
        response = `Estou me sentindo ${bot.mood} hoje! E você?`;
    } else if (lowerMsg.includes(bot.hobby)) {
        response = `Ah, você mencionou ${bot.hobby}! Eu adoro isso. O que você gosta especificamente?`;
    } else if (lowerMsg.includes('?')) {
        response = `Essa é uma ótima pergunta! Na minha opinião... (pensando) talvez a resposta esteja em ${randomChoice(bot.knowledge)}.`;
    } else {
        const genericResponses = [
            'Interessante! Conte-me mais.',
            'Eu vejo... E como você se sente sobre isso?',
            `Isso me lembra de ${randomChoice(bot.knowledge)}.`,
            'Hmm, nunca pensei por esse ângulo.',
            'Continue, estou aprendendo muito com você!'
        ];
        response = randomChoice(genericResponses);
    }
    
    // Adicionar emoji ocasionalmente
    if (Math.random() < bot.responsePattern.emoji) {
        response += ' ' + randomChoice(appState.emojis);
    }
    
    return response;
}

// Processar respostas dos bots à mensagem do usuário
function processBotResponses(message) {
    const lowerMsg = message.toLowerCase();
    
    appState.bots.forEach(bot => {
        // Chance de responder baseada na relevância
        let responseProbability = 0.3;
        
        // Aumentar probabilidade se a mensagem mencionar interesses do bot
        if (bot.knowledge.some(topic => lowerMsg.includes(topic.toLowerCase()))) {
            responseProbability += 0.4;
        }
        
        // Aumentar probabilidade se for mencionado diretamente
        if (lowerMsg.includes(bot.username.toLowerCase())) {
            responseProbability += 0.3;
        }
        
        // Decidir se responde
        if (Math.random() < responseProbability) {
            // Atraso humano
            const delay = CHAT_CONFIG.humanLikeDelay ? randomBetween(1000, 5000) : 0;
            
            setTimeout(() => {
                sendBotResponse(bot, message);
            }, delay);
        }
    });
}

// Enviar resposta do bot
function sendBotResponse(bot, triggerMessage) {
    const lowerMsg = triggerMessage.toLowerCase();
    let response = '';
    
    // Resposta baseada no gatilho
    if (lowerMsg.includes('?')) {
        response = `Sobre sua pergunta, eu diria que... ${generateBotMessage(bot)}`;
    } else if (lowerMsg.includes(bot.hobby.toLowerCase())) {
        response = `Eu amo ${bot.hobby}! ${generateBotMessage(bot)}`;
    } else if (lowerMsg.includes(bot.username.toLowerCase())) {
        response = `Você me chamou? ${randomChoice(['😊', '🤔', '😎'])} ${generateBotMessage(bot)}`;
    } else {
        response = generateBotMessage(bot);
    }
    
    // Simular digitação
    simulateTyping(bot, () => {
        sendMessageToChat(bot, response);
    });
}

// Enviar mensagem para o chat
function sendMessageToChat(sender, content, file = null) {
    if (!content && !file) return;
    
    const message = {
        id: generateId(),
        sender,
        content,
        file,
        timestamp: new Date(),
        likes: 0
    };
    
    appState.messages.push(message);
    displayMessage(message);
    
    // Notificação de mensagem
    if (sender.id !== appState.currentUser.id) {
        playSound('message');
    }
    
    // Aprendizado dos bots
    if (!sender.isBot && content) {
        updateBotKnowledge(content);
    }
}

// Atualizar conhecimento dos bots
function updateBotKnowledge(content) {
    // Análise simples para extrair tópicos
    const words = content.toLowerCase().split(/\s+/);
    const newTopics = words.filter(word => 
        word.length > 4 && 
        !appState.stopWords.includes(word) && 
        /^[a-záéíóúâêôãõç]+$/.test(word)
    );
    
    // Cada bot tem uma chance de aprender
    appState.bots.forEach(bot => {
        if (Math.random() < CHAT_CONFIG.learningRate) {
            newTopics.forEach(topic => {
                if (!bot.knowledge.includes(topic)) {
                    bot.knowledge.push(topic);
                }
            });
        }
    });
}

// Exibir mensagem no chat
function displayMessage(message) {
    const container = document.getElementById('messages-container');
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.dataset.id = message.id;
    
    // Formatar hora
    const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Criar elementos da mensagem
    messageElement.innerHTML = `
        <div class="message-avatar" style="background-color: ${message.sender.color}">
            ${message.sender.avatar}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username" style="color: ${message.sender.color}">
                    ${message.sender.username}
                </span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-text">${formatMessageContent(message.content)}</div>
            ${message.file ? `<div class="message-media">
                ${message.file.type.includes('image') ? 
                    `<img src="${URL.createObjectURL(message.file)}" alt="Mídia">` : 
                    `<video controls><source src="${URL.createObjectURL(message.file)}"></video>`}
            </div>` : ''}
        </div>
    `;
    
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

// Exibir mensagem privada
function displayPrivateMessage(message, isCurrentUser) {
    const container = document.getElementById('private-messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isCurrentUser ? 'user-message' : 'other-message'}`;
    
    const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <div class="message-avatar" style="background-color: ${message.sender.color}">
            ${message.sender.avatar}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username" style="color: ${message.sender.color}">
                    ${message.sender.username}
                </span>
                <span class="message-time">${timeString}</span>
            </div>
            <div class="message-text">${formatMessageContent(message.content)}</div>
        </div>
    `;
    
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
}

// Formatar conteúdo da mensagem
function formatMessageContent(content) {
    if (!content) return '';
    
    // Substituir URLs por links
    let formatted = content.replace(
        /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/ig, 
        '<a href="$&" target="_blank">$&</a>'
    );
    
    // Negrito (entre **)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Itálico (entre _)
    formatted = formatted.replace(/\_(.*?)\_/g, '<em>$1</em>');
    
    return formatted;
}

// Adicionar mensagem do sistema
function addSystemMessage(content) {
    const message = {
        id: generateId(),
        sender: { username: 'Sistema', color: '#999', avatar: '⚙️' },
        content,
        timestamp: new Date()
    };
    
    appState.messages.push(message);
    displayMessage(message);
}

// Adicionar usuário à lista
function addUserToList(user) {
    appState.onlineUsers.push(user);
    updateUserList();
}

// Atualizar lista de usuários
function updateUserList() {
    const container = document.getElementById('user-list');
    container.innerHTML = '';
    
    // Ordenar: usuário atual primeiro, depois bots
    const sortedUsers = [...appState.onlineUsers].sort((a, b) => {
        if (a.id === appState.currentUser.id) return -1;
        if (b.id === appState.currentUser.id) return 1;
        return a.isBot === b.isBot ? 0 : a.isBot ? 1 : -1;
    });
    
    sortedUsers.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.dataset.id = user.id;
        
        userElement.innerHTML = `
            <div class="avatar" style="background-color: ${user.color}">${user.avatar}</div>
            <div class="username">${user.username}</div>
            <div class="status ${user.online ? '' : 'offline'}"></div>
            <div class="user-actions">
                <button class="pm-btn" title="Mensagem privada"><i class="fas fa-comment-dots"></i></button>
                <button class="block-btn" title="Bloquear"><i class="fas fa-ban"></i></button>
            </div>
        `;
        
        // Eventos de interação
        userElement.querySelector('.pm-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openPrivateChat(user);
        });
        
        userElement.querySelector('.block-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            blockUser(user);
        });
        
        userElement.addEventListener('click', () => {
            // Focar na mensagem do usuário
            highlightUserMessages(user);
        });
        
        container.appendChild(userElement);
    });
}

// Atualizar status do usuário (digitação)
function updateUserStatus(user) {
    const userElement = document.querySelector(`.user-item[data-id="${user.id}"]`);
    if (!userElement) return;
    
    const usernameElement = userElement.querySelector('.username');
    if (user.typing) {
        usernameElement.textContent = `${user.username} está digitando...`;
    } else {
        usernameElement.textContent = user.username;
    }
}

// Abrir chat privado
function openPrivateChat(user) {
    appState.activePrivateChat = user;
    
    // Atualizar título
    document.getElementById('private-chat-title').textContent = `Privado com ${user.username}`;
    
    // Limpar mensagens anteriores
    document.getElementById('private-messages').innerHTML = '';
    
    // Carregar histórico de mensagens
    if (appState.privateMessages[user.id]) {
        appState.privateMessages[user.id].forEach(msg => {
            displayPrivateMessage(msg, msg.sender.id === appState.currentUser.id);
        });
    }
    
    // Mostrar modal
    document.getElementById('private-chat-modal').classList.remove('hidden');
}

// Fechar chat privado
function closePrivateChat() {
    document.getElementById('private-chat-modal').classList.add('hidden');
    appState.activePrivateChat = null;
}

// Bloquear usuário
function blockUser(user) {
    // Na implementação real, isso impediria mensagens do usuário
    addSystemMessage(`Você bloqueou ${user.username}. Eles não podem mais enviar mensagens para você.`);
    
    // Remover da lista de online (apenas visual)
    appState.onlineUsers = appState.onlineUsers.filter(u => u.id !== user.id);
    updateUserList();
}

// Destacar mensagens do usuário
function highlightUserMessages(user) {
    const messages = document.querySelectorAll('.message');
    
    messages.forEach(msg => {
        if (msg.dataset.senderId === user.id) {
            msg.style.backgroundColor = '#f0f8ff';
            setTimeout(() => {
                msg.style.backgroundColor = '';
            }, 2000);
        }
    });
}

// Simular atividade de usuários
function simulateUserActivity() {
    // Entrada e saída aleatória de usuários
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% de chance de mudança
            const bot = randomChoice(appState.bots);
            bot.online = !bot.online;
            
            updateUserList();
            addSystemMessage(`${bot.username} ${bot.online ? 'entrou' : 'saiu'} do chat.`);
            
            if (bot.online) {
                playSound('join');
                // Retomar comportamento
                startBotBehavior(bot);
            } else {
                playSound('leave');
            }
        }
    }, 10000);
    
    // Atualização de humor e status dos bots
    setInterval(() => {
        appState.bots.forEach(bot => {
            if (Math.random() < 0.2) {
                const moods = ['feliz', 'neutro', 'curioso', 'animado', 'relaxado', 'entediado'];
                bot.mood = randomChoice(moods);
                
                // Mudança de humor pode afetar padrão de resposta
                if (bot.mood === 'feliz') bot.responsePattern.emoji += 0.1;
                if (bot.mood === 'entediado') bot.responsePattern.emoji -= 0.1;
            }
        });
    }, 30000);
}

// Configurar rolagem automática
function setupAutoScroll() {
    const container = document.getElementById('messages-container');
    
    container.addEventListener('scroll', function() {
        const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        container.dataset.autoScroll = isNearBottom ? 'true' : 'false';
    });
    
    // Observar novas mensagens
    const observer = new MutationObserver(function() {
        if (container.dataset.autoScroll === 'true') {
            container.scrollTop = container.scrollHeight;
        }
    });
    
    observer.observe(container, { childList: true });
}

// Tocar som
function playSound(type) {
    if (document.getElementById('sound-btn').classList.contains('active')) {
        const audio = new Audio(appState.sounds[type]);
        audio.play().catch(e => console.log('Autoplay bloqueado:', e));
    }
}

// Alternar som
function toggleSound() {
    const btn = document.getElementById('sound-btn');
    btn.classList.toggle('active');
}

// Alternar seletor de emoji
function toggleEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    picker.classList.toggle('hidden');
    
    if (!picker.innerHTML) {
        // Popular emojis na primeira vez
        appState.emojis.forEach(emoji => {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.addEventListener('click', () => {
                document.getElementById('message-input').value += emoji;
            });
            picker.appendChild(span);
        });
    }
}

// Manipular upload de arquivo
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Verificar tipo e tamanho
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione uma imagem (JPEG, PNG, GIF) ou vídeo (MP4).');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('O arquivo é muito grande. Tamanho máximo: 5MB.');
        return;
    }
    
    appState.currentFile = file;
    document.getElementById('message-input').placeholder = `Pronto para enviar ${file.name}`;
}

// Utilitários
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function generateRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function generateAvatar(name) {
    return name.charAt(0).toUpperCase() + name.charAt(1).toLowerCase();
}

function generateBotName() {
    const prefixes = ['Dark', 'Super', 'Mega', 'Ultra', 'Hyper', 'Cyber', 'Alpha', 'Beta', 'Gamma'];
    const suffixes = ['Player', 'Gamer', 'Coder', 'Hacker', 'Ninja', 'Master', 'Lord', 'King', 'Queen'];
    const numbers = ['99', '42', '7', '13', '21', '64', '100', '0', '666', '123'];
    
    return `${randomChoice(prefixes)}${randomChoice(suffixes)}${randomChoice(numbers)}`;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Palavras comuns para ignorar no aprendizado
appState.stopWords = [
    'que', 'com', 'para', 'por', 'uma', 'uns', 'umas', 'dos', 'das', 'nos', 'nas',
    'pelo', 'pela', 'pelos', 'pelas', 'este', 'esta', 'estes', 'estas', 'aquele',
    'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'de', 'a', 'o', 'em', 'e',
    'é', 'do', 'da', 'no', 'na', 'um', 'como', 'mas', 'se', 'ou', 'sem', 'ao', 'à',
    'são', 'mais', 'menos', 'muito', 'pouco', 'quando', 'onde', 'porque', 'porquê',
    'porquê', 'porquê', 'porquê', 'porquê', 'porquê', 'porquê', 'porquê', 'porquê'
];