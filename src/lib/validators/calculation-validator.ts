import { z } from 'zod';

export const calculationSchema = z.object({
  title: z.string().min(1, { message: 'Tytuł jest wymagany.' }),
  calculation_type: z.string().min(1, { message: 'Typ kalkulacji jest wymagany.' }),
  input_json: z.record(z.any(), {
    invalid_type_error: 'Dane wejściowe muszą być obiektem.',
  }),
  result_json: z.record(z.any(), {
    invalid_type_error: 'Dane wynikowe muszą być obiektem.',
  }),
}); 