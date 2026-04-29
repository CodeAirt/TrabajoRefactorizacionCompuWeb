export const logger = {
  log: (msg: string, level: string = "INFO", data: any = null): void => {
    const timestamp = new Date().toISOString();
    const nivelFormateado = level.toUpperCase();
    let entry = `[${timestamp}] [${nivelFormateado}] ${msg}`;
    if (data) entry += ` | DATA: ${JSON.stringify(data)}`;
    
    if (nivelFormateado === "ERROR") console.error(entry);
    else if (["WARN", "WARNING"].includes(nivelFormateado)) console.warn(entry);
    else console.info(entry);
  }
};