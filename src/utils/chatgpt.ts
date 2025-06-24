export interface ChatGPTResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

export async function generateSubtasksWithChatGPT(
  taskText: string,
  apiKey: string,
  model: string
): Promise<ChatGPTResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: `Please create detailed, step-by-step subtasks for the following task: ${taskText}. 
                     Return only the subtasks, one per line, without numbering or bullet points.`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content.trim();
      const subtasks = content
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .map((line: string) => line.replace(/^[-*•]\s*/, '')); // Remove common bullet points
      
      return { success: true, data: subtasks };
    } else {
      throw new Error('No response received from ChatGPT.');
    }
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function generatePlanWithChatGPT(
  noteContent: string,
  apiKey: string,
  model: string
): Promise<ChatGPTResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: `Based on the following note content, create a detailed action plan with specific steps:
                     
                     ${noteContent}
                     
                     Please provide a clear, actionable plan with steps that can be implemented.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content.trim();
      const steps = content
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      
      return { success: true, data: steps };
    } else {
      throw new Error('No response received from ChatGPT.');
    }
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}