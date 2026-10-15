import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("email_service")

def send_email_notification(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    if not settings.SMTP_ENABLED or not settings.SMTP_HOST:
        logger.info(f"[DEV MODE - EMAIL NOT SENT] To: {to_email} | Subject: {subject}")
        logger.debug(f"Body: {text_content or html_content}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        server.ehlo()
        if settings.SMTP_PORT == 587:
            server.starttls()
            server.ehlo()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Email successfully delivered to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def notify_new_enquiry(enquiry_ref: str, customer_name: str, phone: str, message: str, customer_email: Optional[str] = None):
    # Admin alert
    admin_subject = f"[Bajaj Enterprises] New Enquiry Received — {enquiry_ref}"
    admin_html = f"""
    <h2>New Customer Enquiry Received</h2>
    <p><strong>Reference:</strong> {enquiry_ref}</p>
    <p><strong>Customer Name:</strong> {customer_name}</p>
    <p><strong>Phone:</strong> {phone}</p>
    <p><strong>Message:</strong></p>
    <p style="background: #f1f5f9; padding: 12px; border-radius: 6px;">{message}</p>
    <p>Visit the admin dashboard to reply or update status.</p>
    """
    if settings.STORE_EMAIL:
        send_email_notification(settings.STORE_EMAIL, admin_subject, admin_html)

    # Customer acknowledgement
    if customer_email:
        cust_subject = f"Enquiry Received — Bajaj Enterprises ({enquiry_ref})"
        cust_html = f"""
        <h2>Namaste {customer_name},</h2>
        <p>Thank you for reaching out to <strong>Bajaj Enterprises</strong> (Alakh Sagar Road, Kote Gate, Bikaner).</p>
        <p>Your enquiry reference number is: <strong>{enquiry_ref}</strong>.</p>
        <p>Our team will contact you shortly via your preferred contact method.</p>
        <br/>
        <p>Warm regards,<br/>Bajaj Enterprises Team<br/>Bikaner, Rajasthan</p>
        """
        send_email_notification(customer_email, cust_subject, cust_html)

def notify_new_order_request(order_ref: str, customer_name: str, phone: str, total_amount: float, customer_email: Optional[str] = None):
    # Admin alert
    admin_subject = f"[Bajaj Enterprises] New Order Request — {order_ref}"
    admin_html = f"""
    <h2>New Order Request Received</h2>
    <p><strong>Reference:</strong> {order_ref}</p>
    <p><strong>Customer:</strong> {customer_name} ({phone})</p>
    <p><strong>Estimated Total:</strong> ₹{total_amount:,.2f}</p>
    <p>Log in to admin dashboard to confirm stock and contact the customer.</p>
    """
    if settings.STORE_EMAIL:
        send_email_notification(settings.STORE_EMAIL, admin_subject, admin_html)

    # Customer acknowledgement
    if customer_email:
        cust_subject = f"Order Request Acknowledgement — Bajaj Enterprises ({order_ref})"
        cust_html = f"""
        <h2>Namaste {customer_name},</h2>
        <p>Thank you for placing an order request with <strong>Bajaj Enterprises</strong>.</p>
        <p>Your Request Reference ID: <strong>{order_ref}</strong></p>
        <p>Total Estimated: <strong>₹{total_amount:,.2f}</strong></p>
        <p><em>Please note: This is an order request acknowledgement. Our team will verify bicycle stock and contact you to confirm fulfillment and pickup/delivery details.</em></p>
        <br/>
        <p>Warm regards,<br/>Bajaj Enterprises<br/>Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan</p>
        """
        send_email_notification(customer_email, cust_subject, cust_html)
