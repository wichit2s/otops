import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.db import transaction
from marketplace.models import Category, Shop, Product, Order, OrderItem, Status, Review
from faker import Faker

class Command(BaseCommand):
    help = 'Seeds the database with massive OTOP marketplace data'

    def handle(self, *args, **kwargs):
        fake = Faker(['th_TH', 'en_US'])
        self.stdout.write('Starting massive seeding...')

        with transaction.atomic():
            # 1. Create Statuses
            self.stdout.write('Ensuring statuses exist...')
            status_names = ['PENDING', 'PAID', 'CANCELLED', 'SHIPPED', 'COMPLETED']
            statuses = {}
            for name in status_names:
                status, _ = Status.objects.get_or_create(name=name)
                statuses[name] = status
            
            success_statuses = [statuses['PAID'], statuses['SHIPPED'], statuses['COMPLETED']]

            # 2. Create Users (8,000+ Customers)
            self.stdout.write('Creating 8,100 users...')
            users = []
            for i in range(8100):
                username = f'user_{i}_{fake.unique.user_name()}'[:150] # ensure uniqueness
                users.append(User(
                    username=username,
                    email=fake.email(),
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                ))
            
            User.objects.bulk_create(users, batch_size=1000)
            all_users = list(User.objects.all()) # Re-fetch to get IDs
            self.stdout.write(f'Created/Ensured {len(all_users)} users.')

            # 3. Create Categories (20+)
            self.stdout.write('Creating 25 categories...')
            categories_list = [
                'อาหารและเครื่องดื่ม', 'เครื่องแต่งกาย', 'ของใช้ตกแต่ง', 'สมุนไพรประทินผิว', 
                'ผ้าไทย', 'เครื่องจักสาน', 'อัญมณีและเครื่องประดับ', 'ของเล่นภูมิปัญญา',
                'เครื่องปั้นดินเผา', 'ผลิตภัณฑ์จากไม้', 'เครื่องเงิน', 'ผลไม้อบแห้ง',
                'เครื่องปรุงรส', 'ชาและสมุนไพรดื่ม', 'ผลิตภัณฑ์บำรุงเส้นผม', 'สบู่ธรรมชาติ',
                'เทียนหอม', 'วัสดุก่อสร้างภูมิปัญญา', 'เครื่องดนตรีไทย', 'รองเท้าทำมือ',
                'กระเป๋าย่านลิเภา', 'เฟอร์นิเจอร์หวาย', 'ภาพวาดศิลปะพื้นบ้าน', 'หมอนขวาน',
                'เบญจรงค์'
            ]
            category_objs = []
            for name in categories_list:
                slug = slugify(name)
                category_objs.append(Category(name=name, slug=slug))
            
            Category.objects.bulk_create(category_objs, ignore_conflicts=True)
            all_categories = list(Category.objects.all())
            self.stdout.write(f'Created {len(all_categories)} categories.')

            # 4. Create Shops (300+)
            self.stdout.write('Creating 350 shops...')
            shop_objs = []
            shop_owners = random.sample(all_users, 350)
            for i in range(350):
                shop_objs.append(Shop(
                    name=f'OTOP {fake.company()} {i}',
                    category=random.choice(all_categories),
                    owner=shop_owners[i],
                    description=fake.text(max_nb_chars=200)
                ))
            
            Shop.objects.bulk_create(shop_objs)
            all_shops = list(Shop.objects.all())
            self.stdout.write(f'Created {len(all_shops)} shops.')

            # Group shops by category for easy product assignment (to pass validation)
            shops_by_cat = {}
            for s in all_shops:
                if s.category_id not in shops_by_cat:
                    shops_by_cat[s.category_id] = []
                shops_by_cat[s.category_id].append(s)

            # 5. Create Products (5,000+)
            self.stdout.write('Creating 5,500 products...')
            product_objs = []
            for i in range(5500):
                # Pick a random category that has shops
                cat = random.choice(all_categories)
                while cat.id not in shops_by_cat:
                    cat = random.choice(all_categories)
                
                shop = random.choice(shops_by_cat[cat.id])
                
                product_objs.append(Product(
                    name=f'{fake.catch_phrase()} {i}',
                    shop=shop,
                    category=cat,
                    price=random.randint(50, 5000),
                    description=fake.paragraph(nb_sentences=3),
                    stock=random.randint(10, 500)
                ))
            
            Product.objects.bulk_create(product_objs, batch_size=1000)
            all_products = list(Product.objects.all())
            self.stdout.write(f'Created {len(all_products)} products.')

            # 6. Create Orders (10,000 successful)
            self.stdout.write('Creating 10,000 successful orders...')
            order_objs = []
            customers = random.sample(all_users, 8000) if len(all_users) >= 8000 else all_users
            
            for i in range(10000):
                order_objs.append(Order(
                    customer=random.choice(customers),
                    status=random.choice(success_statuses),
                    total_price=0 # Will update after creating items
                ))
            
            Order.objects.bulk_create(order_objs, batch_size=2000)
            # Fetch orders back with customer and status to avoid N+1 if needed, 
            # though we just need the IDs for OrderItems.
            # Using iterator() to handle memory for 10k objects
            all_orders = list(Order.objects.order_by('-id')[:10000]) 
            self.stdout.write(f'Created {len(all_orders)} orders.')

            # 7. Create OrderItems
            self.stdout.write('Creating order items...')
            order_item_objs = []
            order_totals = {} # Map order_id -> total_price

            for order in all_orders:
                # 1-4 items per order
                num_items = random.randint(1, 4)
                sampled_products = random.sample(all_products, num_items)
                total = 0
                for prod in sampled_products:
                    qty = random.randint(1, 3)
                    price = prod.price
                    subtotal = price * qty
                    order_item_objs.append(OrderItem(
                        order=order,
                        product=prod,
                        shop=prod.shop,
                        quantity=qty,
                        price=price
                    ))
                    total += subtotal
                order_totals[order.id] = total

            OrderItem.objects.bulk_create(order_item_objs, batch_size=2000)
            self.stdout.write(f'Created {len(order_item_objs)} order items.')

            # Update Order totals
            self.stdout.write('Updating order totals...')
            # We can use bulk_update for this
            orders_to_update = []
            for order in all_orders:
                order.total_price = order_totals.get(order.id, 0)
                orders_to_update.append(order)
            
            Order.objects.bulk_update(orders_to_update, ['total_price'], batch_size=2000)

            # 8. Create Reviews (for COMPLETED orders)
            self.stdout.write('Creating sample reviews...')
            review_objs = []
            completed_orders = [o for o in all_orders if o.status == statuses['COMPLETED']]
            
            # Rate about 50% of completed orders
            sampled_completed = random.sample(completed_orders, len(completed_orders) // 2)
            for order in sampled_completed:
                # Optionally rate shop
                if random.choice([True, False]):
                    # Get a shop from the order's items
                    items = [it for it in order_item_objs if it.order_id == order.id]
                    if items:
                        shop = items[0].shop
                        review_objs.append(Review(
                            customer=order.customer,
                            order=order,
                            shop=shop,
                            rating=random.randint(3, 5), # mostly positive
                            comment=fake.sentence() if random.choice([True, False]) else ""
                        ))
                
                # Optionally rate a product
                if random.choice([True, False]):
                    items = [it for it in order_item_objs if it.order_id == order.id]
                    if items:
                        prod = random.choice(items).product
                        review_objs.append(Review(
                            customer=order.customer,
                            order=order,
                            product=prod,
                            rating=random.randint(3, 5),
                            comment=fake.sentence() if random.choice([True, False]) else ""
                        ))
            
            Review.objects.bulk_create(review_objs, batch_size=2000)
            self.stdout.write(f'Created {len(review_objs)} reviews.')

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(all_orders)} orders and {Review.objects.count()} reviews!'))
