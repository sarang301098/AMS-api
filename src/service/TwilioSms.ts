interface Request {
  phone: string;
}

interface Response {
  message: string;
}

class TwilioSmsService {
  private static instance: TwilioSmsService;

  constructor() {
    if (TwilioSmsService.instance instanceof TwilioSmsService) {
      return TwilioSmsService.instance;
    }
    TwilioSmsService.instance = this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(request: Request): Promise<Response> {
    // const { phone } = request;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const client = require('twilio')(
      'AC34add8efa1e3fb3b0268a59bf829e54a' || process.env.TWILIO_ACCOUNT_SID,
      'e10f3600caf106db5cf8e20c8c3d5344' || process.env.TWILIO_AUTH_TOKEN,
    );

    await client.messages
      .create({
        // from: '+15005550006' || process.env.TWILIO_PHONE_NUMBER,
        messagingServiceSid: 'MG32c353e7575d349171d524f5724d1887',
        to: '+919601005881' || process.env.CELL_PHONE_NUMBER,
        body: 'You just sent an SMS from Node.js using Twilio!',
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((error: any) => new Error(error));

    const response: Response = {
      message: 'Reset password link has been sent to your email id.',
    };

    return response;
  }
}

export default TwilioSmsService;
