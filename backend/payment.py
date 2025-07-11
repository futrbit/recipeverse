# payment.py
from flask import Blueprint, jsonify, redirect, url_for, current_app, session, request # Added 'request' here
from flask_login import current_user, login_required
import stripe
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define Blueprint
payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create-checkout-session', methods=['POST'])
@login_required
def create_checkout_session():
    # 'request' is now imported and accessible
    logger.debug(f"Creating checkout session for user {current_user.username}, plan: {request.args.get('plan')}")
    try:
        plan = request.args.get('plan')
        price_id = (
            current_app.config['STRIPE_MONTHLY_PRICE_ID'] if plan == 'monthly'
            else current_app.config['STRIPE_YEARLY_PRICE_ID']
        )

        checkout_session = stripe.checkout.Session.create(
            customer_email=current_user.email,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=url_for('home', _external=True),
            cancel_url=url_for('pricing', _external=True),
        )
        logger.info(f"Checkout session created: {checkout_session.id}")
        return jsonify({'sessionId': checkout_session.id})
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return jsonify({'error': 'stripe_error', 'message': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in create_checkout_session: {str(e)}")
        return jsonify({'error': 'server_error', 'message': 'Failed to create checkout session'}), 500

@payment_bp.route('/manage-subscription')
@login_required
def manage_subscription():
    logger.debug(f"User {current_user.username} accessing manage subscription")
    try:
        # Assume user has a stripe_customer_id stored in the User model
        from models import User
        with current_app.app_context():
            user = current_user
            if not user.stripe_customer_id:
                logger.warning(f"No Stripe customer ID for user {user.username}")
                return redirect(url_for('pricing'))

            portal_session = stripe.billing_portal.Session.create(
                customer=user.stripe_customer_id,
                return_url=url_for('home', _external=True),
            )
            logger.info(f"Billing portal session created for user {user.username}")
            return redirect(portal_session.url)
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error in manage_subscription: {str(e)}")
        return jsonify({'error': 'stripe_error', 'message': str(e)}), 500
    except Exception as e:
        logger.error(f"Unexpected error in manage_subscription: {str(e)}")
        return jsonify({'error': 'server_error', 'message': 'Failed to manage subscription'}), 500
