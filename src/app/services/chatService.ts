export const chatService = async (messages: any[], prompt: string, userChoice: string | null) => {
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

    if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
    }

    const data = await response.json()
    console.log("response:",response)
    return data;
}