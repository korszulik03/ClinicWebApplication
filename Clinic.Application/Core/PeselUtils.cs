using System;

namespace Clinic.Application.Core
{
    public static class PeselUtils
    {
        // Sprawdza poprawność matematyczną (długość, cyfry, suma kontrolna)
        public static bool IsValid(string pesel)
        {
            if (string.IsNullOrWhiteSpace(pesel) || pesel.Length != 11 || !long.TryParse(pesel, out _))
                return false;

            int[] weights = { 1, 3, 7, 9, 1, 3, 7, 9, 1, 3 };
            int sum = 0;

            for (int i = 0; i < 10; i++)
                sum += int.Parse(pesel[i].ToString()) * weights[i];

            int controlDigit = (10 - (sum % 10)) % 10;
            int lastDigit = int.Parse(pesel[10].ToString());

            return controlDigit == lastDigit;
        }

        // Wyciąga datę urodzenia
        public static DateTime? GetBirthDate(string pesel)
        {
            if (!IsValid(pesel)) return null;

            int year = int.Parse(pesel.Substring(0, 2));
            int month = int.Parse(pesel.Substring(2, 2));
            int day = int.Parse(pesel.Substring(4, 2));
            int century;

            // Logika stuleci w PESEL
            if (month > 80) { century = 1800; month -= 80; }
            else if (month > 60) { century = 2200; month -= 60; }
            else if (month > 40) { century = 2100; month -= 40; }
            else if (month > 20) { century = 2000; month -= 20; }
            else { century = 1900; }

            year += century;

            try
            {
                return new DateTime(year, month, day);
            }
            catch
            {
                return null;
            }
        }

        // Wyciąga płeć
        public static string GetGender(string pesel)
        {
            if (!IsValid(pesel)) return "Nieznana";

            // 10. cyfra (indeks 9) oznacza płeć:
            // Parzysta (0, 2, 4, 6, 8) = Kobieta
            // Nieparzysta (1, 3, 5, 7, 9) = Mężczyzna
            int genderDigit = int.Parse(pesel[9].ToString());
            return genderDigit % 2 == 0 ? "Kobieta" : "Mężczyzna";
        }
    }
}