using Clinic.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Clinic.Infrastructure
{
    public class Seed
    {
        private static readonly Random _random = new Random();

        // --- DANE POMOCNICZE ---
        // Imiona i Nazwiska
        private static readonly string[] _firstNamesMale = { "Adam", "Piotr", "Krzysztof", "Tomasz", "Paweł", "Michał", "Marcin", "Jakub", "Andrzej", "Grzegorz", "Łukasz", "Kamil", "Dariusz", "Mateusz", "Bartosz", "Wojciech", "Stanisław", "Marek", "Rafał", "Szymon", "Jacek", "Janusz", "Mirosław", "Zbigniew", "Filip", "Borys", "Kajetan", "Igor", "Witold", "Cezary", "Leszek", "Władysław", "Marian", "Zdzisław", "Edward" };
        private static readonly string[] _firstNamesFemale = { "Anna", "Maria", "Katarzyna", "Małgorzata", "Agnieszka", "Krystyna", "Barbara", "Ewa", "Elżbieta", "Zofia", "Janina", "Teresa", "Joanna", "Magdalena", "Monika", "Jadwiga", "Danuta", "Irena", "Halina", "Helena", "Beata", "Aleksandra", "Dorota", "Mariola", "Natalia", "Julia", "Zuzanna", "Hanna", "Maja", "Lena", "Wiktoria", "Oliwia", "Alicja", "Antonina" };
        private static readonly string[] _lastNames = { "Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Jankowski", "Mazur", "Kwiatkowski", "Krawczyk", "Kaczmarek", "Piotrowski", "Grabowski", "Zając", "Pawłowski", "Michalski", "Król", "Wieczorek", "Jabłoński", "Wróbel", "Nowakowski", "Majewski", "Olszewski", "Stępień", "Malinowski", "Jaworski", "Adamczyk", "Dudek", "Górski", "Sikora", "Baran", "Rutkowski", "Ostrowski" };

        // Objawy i Diagnozy
        private static readonly Dictionary<string, string[]> _symptomsBySpec = new Dictionary<string, string[]>
        {
            { "Kardiolog", new[] { "Kołatanie serca", "Ból w klatce piersiowej", "Wysokie ciśnienie", "Duszności przy wysiłku", "Nieregularne tętno", "Obrzęki kostek" } },
            { "Dermatolog", new[] { "Wysypka na plecach", "Podejrzane znamię", "Trądzik różowaty", "Swędzenie skóry", "Przebarwienia na twarzy", "Łuszczyca" } },
            { "Pediatra", new[] { "Wysoka gorączka", "Ból ucha", "Wymioty i biegunka", "Brak apetytu", "Bilans zdrowia", "Przewlekły kaszel", "Wysypka pieluszkowa" } },
            { "Okulista", new[] { "Pogorszenie wzroku", "Ból oka", "Czerwone oczy", "Mroczki przed oczami", "Badanie okresowe", "Łzawienie oczu" } },
            { "Ortopeda", new[] { "Ból kolana", "Uraz kostki", "Ból kręgosłupa lędźwiowego", "Drętwienie ręki", "Problem ze stawem biodrowym", "Łokieć tenisisty" } },
            { "Neurolog", new[] { "Silne migreny", "Zawroty głowy", "Drętwienie kończyn", "Problemy z pamięcią", "Zaburzenia równowagi", "Rwa kulszowa" } },
            { "Laryngolog", new[] { "Ból gardła", "Zatkany nos", "Szum w uszach", "Chrapanie", "Problemy ze słuchem", "Zapalenie zatok" } },
            { "Psychiatra", new[] { "Obniżony nastrój", "Bezsenność", "Lęki napadowe", "Problemy z koncentracją", "Wahania nastroju", "Wypalenie zawodowe" } },
            { "Endokrynolog", new[] { "Wypadanie włosów", "Nagły przyrost wagi", "Zmęczenie", "Problemy z tarczycą", "Uderzenia gorąca" } },
            { "Urolog", new[] { "Ból przy oddawaniu moczu", "Częstomocz", "Ból w podbrzuszu", "Kamica nerkowa", "Infekcja dróg moczowych" } },
            { "Ginekolog", new[] { "Bóle podbrzusza", "Nieregularne cykle", "Kontrola rutynowa", "Infekcja", "Planowanie ciąży" } },
            { "Onkolog", new[] { "Guzek wyczuwalny palpacyjnie", "Utrata wagi", "Zmiana na skórze", "Przewlekłe osłabienie", "Konsultacja wyników" } },
            { "Internista", new[] { "Przeziębienie", "Grypa", "Ból brzucha", "Ogólne rozbicie", "Skierowanie na badania", "Kaszel suchy" } }
        };

        private static readonly string[] _conclusions = {
            "Stan ogólny dobry. Zalecono odpoczynek.",
            "Infekcja wirusowa. Zalecono domowe leczenie.",
            "Wymagana dalsza diagnostyka obrazowa.",
            "Skierowanie na badania krwi i moczu.",
            "Stan zapalny ustępuje. Kontynuować leczenie.",
            "Konieczna kontrola za 2 tygodnie.",
            "Przewlekłe zmęczenie, zalecono suplementację.",
            "Brak niepokojących objawów klinicznych."
        };

        private static readonly string[] _cancelReasons = {
            "Pacjent nie stawił się na wizytę.",
            "Odwołano telefonicznie przez pacjenta.",
            "Lekarz niedostępny (nagły wypadek).",
            "Pomyłka w rejestracji.",
            "Przełożono na inny termin."
        };

        private static readonly string[] _medPrefixes = { "Cardio", "Neuro", "Gastro", "Derma", "Oculo", "Pneumo", "Hemo", "Osteo", "Ibu", "Para", "Vita", "Anti", "Pro", "Ultra", "Maxi", "Zine", "Hydro", "Lipo", "Gluko", "Alergo" };
        private static readonly string[] _medSuffixes = { "mol", "fen", "tard", "x", "gen", "san", "piryna", "cilin", "statin", "zepam", "zol", "pril", "vir", "biotyk", "vit", "drin", "cort", "med", "sian", "flam" };


        // --- METODA GENERUJĄCA POPRAWNY PESEL ---
        private static string GenerateValidPesel(bool isMale)
        {
            // 1. Losuj datę urodzenia (1950 - 2005)
            int year = _random.Next(1950, 2006);
            int month = _random.Next(1, 13);
            int day = _random.Next(1, DateTime.DaysInMonth(year, month) + 1);

            // 2. Formatuj rok i miesiąc (PESEL ma specyficzne kodowanie stuleci)
            // Dla 1900-1999: miesiąc bez zmian
            // Dla 2000-2099: miesiąc + 20
            int peselMonth = month;
            if (year >= 2000) peselMonth += 20;

            string peselYear = (year % 100).ToString("D2");
            string peselMonthStr = peselMonth.ToString("D2");
            string peselDay = day.ToString("D2");

            // 3. Losuj serię (3 cyfry)
            string serial = _random.Next(0, 1000).ToString("D3");

            // 4. Losuj cyfrę płci (Mężczyzna: nieparzysta, Kobieta: parzysta)
            int genderDigit;
            if (isMale)
            {
                // Musi być nieparzysta (1, 3, 5, 7, 9)
                int[] oddDigits = { 1, 3, 5, 7, 9 };
                genderDigit = oddDigits[_random.Next(oddDigits.Length)];
            }
            else
            {
                // Musi być parzysta (0, 2, 4, 6, 8)
                int[] evenDigits = { 0, 2, 4, 6, 8 };
                genderDigit = evenDigits[_random.Next(evenDigits.Length)];
            }

            // Wstępny PESEL (10 cyfr)
            string pesel10 = $"{peselYear}{peselMonthStr}{peselDay}{serial}{genderDigit}";

            // 5. Oblicz sumę kontrolną
            int[] weights = { 1, 3, 7, 9, 1, 3, 7, 9, 1, 3 };
            int sum = 0;
            for (int i = 0; i < 10; i++)
            {
                sum += int.Parse(pesel10[i].ToString()) * weights[i];
            }

            int controlDigit = (10 - (sum % 10)) % 10;

            return pesel10 + controlDigit;
        }

        public static async Task SeedData(DataContext context, UserManager<AppUser> userManager)
        {
            // A. UŻYTKOWNICY
            if (!userManager.Users.Any())
            {
                var users = new List<AppUser>
                {
                    new AppUser { DisplayName = "Bob", UserName = "bob", Email = "bob@test.com" },
                    new AppUser { DisplayName = "Tom", UserName = "tom", Email = "tom@test.com" },
                    new AppUser { DisplayName = "Administrator", UserName = "admin", Email = "admin@clinic.com" }
                };
                foreach (var user in users) await userManager.CreateAsync(user, "Pa$$w0rd");
            }

            if (context.Doctors.Any()) return;

            // B. SPECJALIZACJE
            var specs = new List<Specialization>();
            foreach (var specName in _symptomsBySpec.Keys)
            {
                specs.Add(new Specialization { Name = specName });
            }
            await context.Specializations.AddRangeAsync(specs);
            await context.SaveChangesAsync();

            // C. LEKARZE
            var doctors = new List<Doctor>();
            doctors.Add(new Doctor { FirstName = "Gregory", LastName = "House", Email = "house@clinic.com", Specialization = specs.First(s => s.Name == "Neurolog") });

            for (int i = 0; i < 15; i++)
            {
                bool isMale = _random.Next(0, 2) == 0;
                string fName = isMale ? _firstNamesMale[_random.Next(_firstNamesMale.Length)] : _firstNamesFemale[_random.Next(_firstNamesFemale.Length)];
                string lName = _lastNames[_random.Next(_lastNames.Length)];
                if (!isMale && lName.EndsWith("ki")) lName = lName.Substring(0, lName.Length - 1) + "a";

                doctors.Add(new Doctor
                {
                    FirstName = fName,
                    LastName = lName,
                    Email = $"{fName.ToLower()}.{lName.ToLower()}{i}@clinic.com",
                    Specialization = specs[_random.Next(specs.Count)]
                });
            }
            await context.Doctors.AddRangeAsync(doctors);
            await context.SaveChangesAsync();

            // D. GRAFIKI
            var nightShiftDocs = doctors.TakeLast(3).Select(d => d.Id).ToList();
            var schedules = new List<Schedule>();

            foreach (var doc in doctors)
            {
                bool isNightDoc = nightShiftDocs.Contains(doc.Id);

                for (int day = 1; day <= 5; day++)
                {
                    TimeSpan start, end;
                    if (isNightDoc)
                    {
                        start = new TimeSpan(16, 0, 0);
                        end = new TimeSpan(23, 59, 0);
                    }
                    else
                    {
                        int shiftStart = _random.Next(7, 10);
                        start = new TimeSpan(shiftStart, 0, 0);
                        end = new TimeSpan(shiftStart + 8, 0, 0);
                    }

                    schedules.Add(new Schedule
                    {
                        DoctorId = doc.Id,
                        DayOfWeek = day,
                        StartTime = start,
                        EndTime = end
                    });
                }
            }
            await context.Schedules.AddRangeAsync(schedules);

            // E. LEKI
            var medications = new List<Medication>();
            var realMeds = new[] { "Ibuprom", "Apap", "Paracetamol", "Nurofen", "Aspirin", "Duomox", "Augmentin", "Ketonal", "No-Spa", "Espumisan", "Gripex", "Polopiryna", "Fervex", "Xanax", "Rennie" };
            foreach (var name in realMeds) medications.Add(new Medication { Name = name });

            int attempts = 0;
            while (medications.Count < 351 && attempts < 10000)
            {
                attempts++;
                string prefix = _medPrefixes[_random.Next(_medPrefixes.Length)];
                string suffix = _medSuffixes[_random.Next(_medSuffixes.Length)];
                string variant = "";

                int variantRnd = _random.Next(0, 10);
                if (variantRnd == 0) variant = " Forte";
                else if (variantRnd == 1) variant = " Max";
                else if (variantRnd == 2) variant = " Duo";
                else if (variantRnd == 3) variant = " Plus";

                string name = prefix + suffix + variant;

                if (!medications.Any(m => m.Name == name))
                {
                    medications.Add(new Medication { Name = name });
                }
            }
            await context.Medications.AddRangeAsync(medications);
            await context.SaveChangesAsync();

            // F. PACJENCI
            var patients = new List<Patient>();
            // Używamy HashSet, żeby PESEL-e były unikalne w seedzie
            var generatedPesels = new HashSet<string>();

            for (int i = 0; i < 574; i++)
            {
                bool isMale = _random.Next(0, 2) == 0;
                string fName = isMale ? _firstNamesMale[_random.Next(_firstNamesMale.Length)] : _firstNamesFemale[_random.Next(_firstNamesFemale.Length)];
                string lName = _lastNames[_random.Next(_lastNames.Length)];
                if (!isMale && lName.EndsWith("ki")) lName = lName.Substring(0, lName.Length - 1) + "a";

                // Generowanie unikalnego, poprawnego PESEL-u
                string pesel;
                do
                {
                    pesel = GenerateValidPesel(isMale);
                } while (generatedPesels.Contains(pesel)); // Powtarzaj aż trafisz na unikalny

                generatedPesels.Add(pesel);

                // Generowanie losowego roku do maila (dla różnorodności)
                string yearSuffix = _random.Next(1960, 2000).ToString();

                patients.Add(new Patient
                {
                    FirstName = fName,
                    LastName = lName,
                    Email = $"p{i}_{yearSuffix}@mail.com",
                    Phone = $"{_random.Next(500, 900)}-{_random.Next(100, 999)}-{_random.Next(100, 999)}",
                    PESEL = pesel
                });
            }
            await context.Patients.AddRangeAsync(patients);
            await context.SaveChangesAsync();

            // G. WIZYTY
            var appointments = new List<Appointment>();
            var today = DateTime.Now.Date;

            foreach (var patient in patients)
            {
                int visitsCount = _random.Next(1, 9);

                for (int v = 0; v < visitsCount; v++)
                {
                    var doc = doctors[_random.Next(doctors.Count)];
                    bool isNightDoc = nightShiftDocs.Contains(doc.Id);

                    int dayOffset = _random.Next(-90, 31);
                    var apptDate = today.AddDays(dayOffset);

                    if (apptDate.DayOfWeek == DayOfWeek.Saturday) apptDate = apptDate.AddDays(2);
                    if (apptDate.DayOfWeek == DayOfWeek.Sunday) apptDate = apptDate.AddDays(1);

                    if (isNightDoc) apptDate = apptDate.AddHours(_random.Next(16, 23));
                    else apptDate = apptDate.AddHours(_random.Next(8, 15));

                    apptDate = apptDate.AddMinutes(_random.Next(0, 4) * 15);

                    string status;
                    string note;

                    if (dayOffset < 0)
                    {
                        if (_random.Next(0, 100) < 15)
                        {
                            status = "Cancelled";
                            note = $"Anulowano. Powód: {_cancelReasons[_random.Next(_cancelReasons.Length)]}";
                        }
                        else
                        {
                            status = "Completed";
                            string diagnosis = _conclusions[_random.Next(_conclusions.Length)];
                            if (_random.Next(0, 2) == 0) note = $"Wnioski: {diagnosis} Przepisano leki.";
                            else note = $"Wnioski: {diagnosis} Zalecenia ogólne.";
                        }
                    }
                    else if (dayOffset == 0)
                    {
                        status = "Confirmed";
                        note = "Wizyta potwierdzona dzisiaj.";
                    }
                    else
                    {
                        status = "Scheduled";
                        string specName = doc.Specialization.Name;
                        string[] possibleSymptoms = _symptomsBySpec.ContainsKey(specName) ? _symptomsBySpec[specName] : _symptomsBySpec["Internista"];
                        string symptom = possibleSymptoms[_random.Next(possibleSymptoms.Length)];
                        note = $"Pacjent zgłasza: {symptom}.";
                    }

                    appointments.Add(new Appointment
                    {
                        DateTime = apptDate,
                        PatientId = patient.Id,
                        DoctorId = doc.Id,
                        Status = status,
                        Notes = note
                    });
                }
            }

            await context.Appointments.AddRangeAsync(appointments);
            await context.SaveChangesAsync();

            // H. RECEPTY
            var prescriptions = new List<Prescription>();
            var medIds = medications.Select(m => m.Id).ToList();

            var apptsWithMedsIds = await context.Appointments
                .Where(a => a.Notes.Contains("Przepisano leki"))
                .Select(a => new { a.Id, a.DateTime })
                .ToListAsync();

            foreach (var apptData in apptsWithMedsIds)
            {
                int medsCount = _random.Next(1, 4);
                var presMeds = new List<PrescriptionMedication>();
                var usedMedIds = new HashSet<int>();

                for (int m = 0; m < medsCount; m++)
                {
                    int randomMedId = medIds[_random.Next(medIds.Count)];
                    if (usedMedIds.Add(randomMedId))
                    {
                        presMeds.Add(new PrescriptionMedication
                        {
                            MedicationId = randomMedId,
                            Dosage = $"{_random.Next(1, 4)}x{_random.Next(1, 2)}"
                        });
                    }
                }

                prescriptions.Add(new Prescription
                {
                    AppointmentId = apptData.Id,
                    CreatedAt = apptData.DateTime,
                    PrescriptionMedications = presMeds
                });
            }

            await context.Prescriptions.AddRangeAsync(prescriptions);
            await context.SaveChangesAsync();
        }
    }
}