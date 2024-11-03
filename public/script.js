// API anahtarını window.API_KEY üzerinden alın
const apiKey = window.API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

let currentLanguage = "tr";  // Başlangıç dili Türkçe olarak ayarlandı

const texts = {
    tr: {
        title: "Blockly ile Artık Daha Eğlenceli!",
        outputTitle: "Çıktı",
        explanationTitle: "Açıklama",
        chatTitle: "Chat",
        welcomeMessage: "Merhaba! Kodlama ve teknolojiyle ilgili sorularını buraya yazabilirsin!",
        userInputPlaceholder: "Sorunu yaz...",
        sendBtn: "Gönder",
        runCodeBtn: "Kodu Çalıştır ve Açıkla",
        toolboxCategories: {
            controls: "Kontroller",
            logic: "Mantık",
            math: "Matematik",
            text: "Metin",
            variables: "Değişkenler"
        },
        explainPrompt: (code) => `Çocuklar için basit bir dille açıklama yap. Bu kod ne yapıyor?: "${code}".`,
        chatPrompt: (message) => `Çocuklar için teknoloji ve yazılım hakkında anlaşılır bir cevap ver. Soru: "${message}".`
    },
    en: {
        title: "Coding with Blockly is More Fun!",
        outputTitle: "Output",
        explanationTitle: "Explanation",
        chatTitle: "Chat",
        welcomeMessage: "Hello! You can ask your questions about coding and technology here!",
        userInputPlaceholder: "Type your question...",
        sendBtn: "Send",
        runCodeBtn: "Run Code and Explain",
        toolboxCategories: {
            controls: "Controls",
            logic: "Logic",
            math: "Math",
            text: "Text",
            variables: "Variables"
        },
        explainPrompt: (code) => `Explain in a simple way for kids. What does this code do?: "${code}".`,
        chatPrompt: (message) => `Provide a simple and understandable answer for kids about technology and coding. Question: "${message}".`
    }
};

// Diğer mevcut fonksiyonlar ve kodlar burada devam eder

        function updateLanguage(lang) {
            currentLanguage = lang;
            document.getElementById("pageTitle").textContent = texts[lang].title;
            document.getElementById("outputTitle").textContent = texts[lang].outputTitle;
            document.getElementById("explanationTitle").textContent = texts[lang].explanationTitle;
            document.getElementById("chatTitle").textContent = texts[lang].chatTitle;
            document.getElementById("welcomeMessage").textContent = texts[lang].welcomeMessage;
            document.getElementById("userInput").placeholder = texts[lang].userInputPlaceholder;
            document.getElementById("sendBtn").textContent = texts[lang].sendBtn;
            document.getElementById("runCodeBtn").textContent = texts[lang].runCodeBtn;
            updateToolbox(lang);  // Blockly araç kutusunu güncelle
        }

        function updateToolbox(lang) {
            const toolboxXml = `
                <xml>
                    <category name="${texts[lang].toolboxCategories.controls}" colour="#FFAB19">
                        <block type="controls_if"></block>
                        <block type="controls_repeat_ext"></block>
                    </category>
                    <category name="${texts[lang].toolboxCategories.logic}" colour="#5C81A6">
                        <block type="logic_compare"></block>
                        <block type="logic_operation"></block>
                    </category>
                    <category name="${texts[lang].toolboxCategories.math}" colour="#4CAF50">
                        <block type="math_number"></block>
                        <block type="math_arithmetic"></block>
                    </category>
                    <category name="${texts[lang].toolboxCategories.text}" colour="#FF5722">
                        <block type="text"></block>
                        <block type="text_print"></block>
                    </category>
                    <category name="${texts[lang].toolboxCategories.variables}" custom="VARIABLE" colour="#FF9800"></category>
                </xml>
            `;
            const toolbox = Blockly.Xml.textToDom(toolboxXml);
            workspace.updateToolbox(toolbox);
        }

        document.getElementById('lang-tr').addEventListener('click', () => updateLanguage("tr"));
        document.getElementById('lang-en').addEventListener('click', () => updateLanguage("en"));

        document.getElementById('runCodeBtn').addEventListener('click', () => {
            const code = Blockly.JavaScript.workspaceToCode(workspace);

            try {
                const output = eval(code); // Kodu çalıştır
                document.getElementById('outputArea').textContent = output || "Kod başarıyla çalıştırıldı!";
            } catch (error) {
                document.getElementById('outputArea').textContent = 'Kod çalıştırılırken bir hata oluştu.';
                console.error('Kod çalıştırma hatası:', error);
            }

            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: texts[currentLanguage].explainPrompt(code) }] }]
                })
            })
            .then(response => response.json())
            .then(data => {
                const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || "Açıklama alınamadı.";
                document.getElementById('explanationArea').textContent = explanation;
            })
            .catch(() => {
                document.getElementById('explanationArea').textContent = 'Açıklama alınırken bir hata oluştu.';
            });
        });

        document.getElementById('sendBtn').addEventListener('click', () => {
            const userMessage = document.getElementById('userInput').value.trim();
            if (!userMessage) return;

            addMessageToChat(userMessage, 'user-message');
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: texts[currentLanguage].chatPrompt(userMessage) }] }]
                })
            })
            .then(response => response.json())
            .then(data => {
                const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Yanıt alınamadı.";
                addMessageToChat(botResponse, 'bot-message');
                document.getElementById('userInput').value = '';
            })
            .catch(() => {
                addMessageToChat('Bir hata oluştu, lütfen tekrar deneyin.', 'bot-message');
            });
        });

        function addMessageToChat(message, className) {
            const chatBox = document.getElementById('chatBox');
            const messageElement = document.createElement('div');
            messageElement.className = className;
            messageElement.textContent = message;
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        const workspace = Blockly.inject('blocklyDiv', {
            toolbox: `
                <xml>
                    <category name="${texts[currentLanguage].toolboxCategories.controls}" colour="#FFAB19">
                        <block type="controls_if"></block>
                        <block type="controls_repeat_ext"></block>
                    </category>
                    <category name="${texts[currentLanguage].toolboxCategories.logic}" colour="#5C81A6">
                        <block type="logic_compare"></block>
                        <block type="logic_operation"></block>
                    </category>
                    <category name="${texts[currentLanguage].toolboxCategories.math}" colour="#4CAF50">
                        <block type="math_number"></block>
                        <block type="math_arithmetic"></block>
                    </category>
                    <category name="${texts[currentLanguage].toolboxCategories.text}" colour="#FF5722">
                        <block type="text"></block>
                        <block type="text_print"></block>
                    </category>
                    <category name="${texts[currentLanguage].toolboxCategories.variables}" custom="VARIABLE" colour="#FF9800"></category>
                </xml>
            `
        });

        // Sayfa yüklenince varsayılan dil
        updateLanguage("tr");