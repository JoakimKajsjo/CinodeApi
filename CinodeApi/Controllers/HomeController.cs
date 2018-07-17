using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace CinodeApi.Controllers
{
    public class HomeController : Controller
    {
        [HttpGet]
        [Route("json")]
        public JsonResult GetJson(){
            string cookies = GetCookies("joakim.kajsjo@oneagency.se", "");
            return Json(DownloadJson(cookies));
        }

        public string DownloadJson(string cookies)
        {
            WebClient client = new WebClient();
            client.Headers[HttpRequestHeader.Cookie] = cookies;
            client.Headers[HttpRequestHeader.Accept] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
            client.Headers[HttpRequestHeader.AcceptEncoding] = "gzip, deflate, br";

            string json = client.DownloadString("https://app.cinode.com/one-agency/administration/export/assignments/current/Json");

            return json;
        }

        public string GetCookies(string email, string password){
            ChromeOptions options = new ChromeOptions();
            options.AddArgument("--headless");
            IWebDriver webDriver = new ChromeDriver("Resources", options);
            webDriver.Navigate().GoToUrl("https://app.cinode.com/Login?ReturnUrl=%2F");
            IWebElement emailField = webDriver.FindElement(By.Id("Email"));
            emailField.SendKeys(email);
            emailField.Submit();

            IWebElement passwordField = webDriver.FindElement(By.Id("Password"));
            passwordField.SendKeys(password);
            passwordField.Submit();

            string cookies = CookieString(webDriver);
            webDriver.Close();
            return cookies;
        }

        public string CookieString(IWebDriver driver)
        {
            var cookies = driver.Manage().Cookies.AllCookies;
            return string.Join("; ", cookies.Select(c => string.Format("{0}={1}", c.Name, c.Value)));
        }
    }
}
