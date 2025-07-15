import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../shared/constants/http_status_code";
import { ERROR_MESSAGES } from "../../shared/constants/messages";

//  export const frontendEmailLinkgenerator = (baseUrl: string, role: string, token: string): string => {
//     if(role === 'admin'){
//         throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST);
//     }
//     const route = role === 'user' ? '/auth/verify-email' : '/vendor/-verify-email'
//     return `${baseUrl}${route}?token=${token}`;
// }

export const frontendEmailLinkgenerator = (
  baseUrl: string,
  role: 'user' | 'vendor' | 'admin',
  token: string,
  type: 'verify' | 'reset'
): string => {
  if (role === 'admin') {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST);
  }

  const routeMap: Record<'verify' | 'reset', Record<'user' | 'vendor', string>> = {
    verify: {
      user: '/auth/verify-email',
      vendor: '/vendor/verify-email',
    },
    reset: {
      user: '/auth/reset-password/verify',
      vendor: '/vendor/reset-password/verify',
    },
  };

  const route = routeMap[type][role];

  return `${baseUrl}${route}?token=${token}`;
};
