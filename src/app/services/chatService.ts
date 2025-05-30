export const chatService = async (messages: { role: string; content: string }[], prompt: string, userChoice: string | null) => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        messages: [
            ...messages,
            {
            role: "user",
            content: prompt,
            id: `user-${messages.length + 1}`
            }
        ],
        userChoice: userChoice
        })
    })

    const data = await response.json();
    
    if (response.status === 429) {
      throw new Error(data.error || 'Limite de PDFs atingido. Tente novamente mais tarde.');
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }
    
    return data;
}